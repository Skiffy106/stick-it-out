import "./style.css";

const nativeWidth = 1920;
const nativeHeight = 1080;
const keys: Map<string, boolean> = new Map<string, boolean>();
let canvas: HTMLCanvasElement | null;
let ctx: CanvasRenderingContext2D | null;
let sp: ScreenParams  | null;
const PlayerSubCircleRadius = 20
const player: Player = createPlayer()

let isDragging = false
let dragStart: Point | null = null
let currentDragPos: Point | null = null

// Mark: Mouse Events
document.addEventListener("mousedown", (event: MouseEvent) => {
    isDragging = true
    dragStart = { x: event.clientX, y: event.clientY }
    currentDragPos = { x: event.clientX, y: event.clientY }
})

document.addEventListener("mousemove", (event: MouseEvent) => {
    if (isDragging) {
        currentDragPos = { x: event.clientX, y: event.clientY }
    }
});

document.addEventListener("mouseup", (event: MouseEvent) => {
    isDragging = false
    dragStart = null
    currentDragPos = null
    console.log(event.clientX, event.clientY)
});

document.addEventListener("DOMContentLoaded", main);

// MARK: Resize
window.addEventListener("resize", () => {
    resize();
    draw();
});

interface ScreenParams {
    deviceWidth: number,
    deviceHeight: number,
    offSetToNativeTop: number,
    offSetToNativeLeft: number,
    scaleFitNative: number,
}

function resize() {
    if (canvas === null) {
        console.error("Unable to locate `main-canvas`.");
        return
    }
    if (ctx === null) {
        console.error("Unable to initialize canvas conxtext. Your browser or machine may not support it.");
        return
    }

    const deviceWidth = window.innerWidth;
    const deviceHeight = window.innerHeight;

    const scaleFitNative = Math.min(deviceWidth / nativeWidth, deviceHeight / nativeHeight, 1);
    canvas.style.width = deviceWidth + "px";
    canvas.style.height = deviceHeight + "px";
    canvas.width = deviceWidth;
    canvas.height = deviceHeight;

    // sets center of screen to origin
    ctx.setTransform(
        scaleFitNative,0,
        0,scaleFitNative,
        Math.floor(deviceWidth/2),
        Math.floor(deviceHeight/2)
    );
    const offSetToNativeTop = (-nativeHeight/2)*scaleFitNative;
    const offSetToNativeLeft = (-nativeWidth/2)*scaleFitNative;
    sp = {
        deviceWidth,
        deviceHeight,
        offSetToNativeTop,
        offSetToNativeLeft,
        scaleFitNative
    }
}

// MARK: Key Pressed
const onKeyDown = (event: KeyboardEvent): void => {
    keys.set(event.key, true);
  };
  
const onKeyUp = (event: KeyboardEvent): void => {
    keys.set(event.key, false);
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// MARK: Update
function update(deltaTime: number) {
    if (sp === null) return;
    
    const springConstant = 0.8;
    const springDamping = 0.95;
    const angularSpringConstant = 1.0;
    const restLength = player.radius;
    const restitution = 0.7;
    
    const dt = Math.min(deltaTime / 1000, 0.016);
    
    player.coords.forEach((coord, index) => {
        // Radial spring forces
        const xDiff = coord.x - player.center.x;
        const yDiff = coord.y - player.center.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        
        const displacement = distance - restLength;
        const forceMagnitude = -springConstant * displacement;
        
        const springForceX = (forceMagnitude * xDiff / distance);
        const springForceY = (forceMagnitude * yDiff / distance);

        // Angular spacing forces
        const prevIndex = (index - 1 + player.coords.length) % player.coords.length;
        const nextIndex = (index + 1) % player.coords.length;
        const prev = player.coords[prevIndex];
        const next = player.coords[nextIndex];

        // Calculate current angles
        const currentAngle = Math.atan2(yDiff, xDiff);
        const prevAngle = Math.atan2(prev.y - player.center.y, prev.x - player.center.x);
        const nextAngle = Math.atan2(next.y - player.center.y, next.x - player.center.x);

        // Calculate desired angles (evenly spaced)
        const desiredAngleSpacing = (2 * Math.PI) / player.coords.length;
        
        // Calculate angular forces (try to maintain even spacing)
        const prevDiff = normalizeAngle(currentAngle - prevAngle) - desiredAngleSpacing;
        const nextDiff = normalizeAngle(nextAngle - currentAngle) - desiredAngleSpacing;
        
        // Convert angular force to x,y components
        const tangentX = -yDiff / distance;
        const tangentY = xDiff / distance;
        
        const angularForceX = (prevDiff - nextDiff) * angularSpringConstant * tangentX;
        const angularForceY = (prevDiff - nextDiff) * angularSpringConstant * tangentY;

        // Apply all forces with appropriate damping
        player.coords[index].dx += (springForceX + angularForceX) * dt * springDamping;
        player.coords[index].dy += (springForceY + angularForceY) * dt * springDamping;

        // Apply gravity (undampened)
        const gravity = 2000;
        player.coords[index].dy += gravity * dt;

        // Update positions
        coord.x += player.coords[index].dx * dt;
        coord.y += player.coords[index].dy * dt;

        // Handle collisions
        const scaledY = coord.y * sp!.scaleFitNative;
        const scaledRadius = PlayerSubCircleRadius * sp!.scaleFitNative;
        
        if (scaledY + scaledRadius > -sp!.offSetToNativeTop) {
            coord.y = (-sp!.offSetToNativeTop / sp!.scaleFitNative) - PlayerSubCircleRadius;
            player.coords[index].dy = -player.coords[index].dy * restitution;
        } else if (scaledY - scaledRadius < sp!.offSetToNativeTop) {
            coord.y = (sp!.offSetToNativeTop / sp!.scaleFitNative) + PlayerSubCircleRadius;
            player.coords[index].dy = -player.coords[index].dy * restitution;
        }
    });

    // Update center
    let centerX = 0;
    let centerY = 0;
    player.coords.forEach(coord => {
        centerX += coord.x;
        centerY += coord.y;
    });
    player.center.x = centerX / player.coords.length;
    player.center.y = centerY / player.coords.length;
}

// Add this helper function to normalize angles to [-π, π]
function normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

// MARK: Draw
function draw() {
    if (canvas === null) {
        console.error("Canvas is null in draw().");
        return;
    }
    if (ctx === null) {
        console.error("Context is null in draw().");
        return;
    }
    if (sp === null) {
        console.error("Screen Params is null in draw().");
        return;
    }

    ctx.fillStyle = "black"
    ctx.fillRect(-sp.deviceWidth/2 * (1/sp.scaleFitNative), -sp.deviceHeight/2 * (1/sp.scaleFitNative), sp.deviceWidth * (1/sp.scaleFitNative), sp.deviceHeight * (1/sp.scaleFitNative))
    ctx.fillStyle = "white"
    ctx.fillRect(sp.offSetToNativeLeft, sp.offSetToNativeTop, nativeWidth * sp.scaleFitNative, nativeHeight * sp.scaleFitNative)

    ctx.beginPath();
    ctx.arc(player.center.x * sp.scaleFitNative, player.center.y * sp.scaleFitNative, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

    // Draw the circles
    ctx.lineWidth = 2;
    player.coords.forEach((coord) => {
        ctx!.beginPath();
        ctx!.arc(coord.x * sp!.scaleFitNative, coord.y * sp!.scaleFitNative, PlayerSubCircleRadius, 0, 2 * Math.PI);
        ctx!.strokeStyle = "blue";
        ctx!.stroke();
    });
    
    // Draw arrow from origin to drag vector
    
    if (isDragging && dragStart && currentDragPos) {
        ctx.beginPath();
        ctx.moveTo(0 * sp.scaleFitNative, 0 * sp.scaleFitNative);
        
        // Calculate drag vector
        const dragVec = {
            x: (currentDragPos.x - dragStart.x) * -1,
            y: (currentDragPos.y - dragStart.y) * -1,
        };
        
        ctx.lineTo(dragVec.x, dragVec.y);
        ctx.strokeStyle = "yellow";
        ctx.stroke();
        
        // Draw arrowhead
        const headLen = 10;
        const angle = Math.atan2(dragVec.y, dragVec.x);
        
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(dragVec.x, dragVec.y);
        ctx.lineTo(
            dragVec.x - headLen * Math.cos(angle - Math.PI / 6),
            dragVec.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(dragVec.x, dragVec.y);
        ctx.lineTo(
            dragVec.x - headLen * Math.cos(angle + Math.PI / 6),
            dragVec.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        console.log(dragVec)
    }
}

// MARK: Game Loop
let lastTime = 0;
function gameLoop(timestamp: number) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    update(deltaTime);
    draw()
    requestAnimationFrame(gameLoop);
}

// MARK: Main
function main() {
    canvas = document.querySelector("#main-canvas") as HTMLCanvasElement
    if (canvas === null) {
        console.error("Unable to locate `main-canvas`.");
        return;
    }

    ctx = canvas.getContext("2d");
    if (ctx === null) {
        console.error("Unable to initialize canvas conxtext. Your browser or machine may not support it.");
        return;
    }

    resize()
    if (sp === null) {
        console.error("An error occured while resizing the window.");
        return;
    }
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}


interface Point {
    x: number,
    y: number,
}

interface Particle {
    x: number,
    y: number,
    dx: number,
    dy: number,
    radius: number,
    color: string,
}

interface Player {
    radius: number,
    coords: Particle[]
    center: Point
}

function createPlayer(): Player {
    const radius = 80
    const center: Point = { x: 0, y: 0 };
    const coords: Particle[] = [];

    const numberOfCircles = 8;
    const angleOffset = Math.PI / 8;
    const angleIncrement = (2 * Math.PI) / numberOfCircles;

    for (let i = 0; i < numberOfCircles; i++) {
        const angle = i * angleIncrement + angleOffset;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        coords.push({ x, y, dx: 0, dy: 0, radius: PlayerSubCircleRadius, color: "blue" });
    }
    return { radius, coords, center };
}