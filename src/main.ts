import "./style.css";
import { Slime } from "./slime";
import { ScreenParams, Vector2 } from "./types";
import { scaleVector } from "./utils";
const nativeWidth = 1920;
const nativeHeight = 1080;
const keys: Map<string, boolean> = new Map<string, boolean>();
let canvas: HTMLCanvasElement | null;
let ctx: CanvasRenderingContext2D | null;
let sp: ScreenParams  | null;
const slime = new Slime(0, 0, 80);

let isDragging = false
let dragStart: Vector2 | null = null
let currentDragPos: Vector2 | null = null

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

document.addEventListener("mouseup", (_: MouseEvent) => {
    if (!isDragging || !currentDragPos || !dragStart) {
        return
    }
    const jumpVector = {
        x: (currentDragPos.x - dragStart.x) * -1,
        y: (currentDragPos.y - dragStart.y) * -1
    }
    
    slime.jump(scaleVector(jumpVector, 10), sp!)
    isDragging = false
    dragStart = null
    currentDragPos = null
});

document.addEventListener("DOMContentLoaded", main);

// MARK: Resize
window.addEventListener("resize", () => {
    resize();
    draw();
});

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
    if (keys.get("a")) {
        slime.moveLeft(sp!);
    }
    if (keys.get("d")) {
        slime.moveRight(sp!);
    }
    slime.update(deltaTime, sp!);
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

    // Draw background
    ctx.fillStyle = "black"
    ctx.fillRect(-sp.deviceWidth/2 * (1/sp.scaleFitNative), -sp.deviceHeight/2 * (1/sp.scaleFitNative), sp.deviceWidth * (1/sp.scaleFitNative), sp.deviceHeight * (1/sp.scaleFitNative))

    // Draw foreground
    ctx.fillStyle = "white"
    ctx.fillRect(sp.offSetToNativeLeft, sp.offSetToNativeTop, nativeWidth * sp.scaleFitNative, nativeHeight * sp.scaleFitNative)
    
    // Draw drag arrow
    if (isDragging && dragStart && currentDragPos) {
        const center = slime.getCenterPosition();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(center.x * sp.scaleFitNative, center.y * sp.scaleFitNative);
        
        // Calculate drag vector
        const dragVec = {
            x: (currentDragPos.x - dragStart.x) * -1,
            y: (currentDragPos.y - dragStart.y) * -1,
        };
        
        // Calculate drag length and normalize head size
        const dragLength = Math.sqrt(dragVec.x * dragVec.x + dragVec.y * dragVec.y);
        const headLen = Math.min(dragLength * 0.4, 20);
        
        ctx.lineTo(center.x * sp.scaleFitNative + dragVec.x, center.y * sp.scaleFitNative + dragVec.y);
        ctx.strokeStyle = "yellow";
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(dragVec.y, dragVec.x);
        
        ctx.beginPath();
        ctx.moveTo(center.x * sp.scaleFitNative + dragVec.x, center.y * sp.scaleFitNative + dragVec.y);
        ctx.lineTo(
            center.x * sp.scaleFitNative + dragVec.x - headLen * Math.cos(angle - Math.PI / 6),
            center.y * sp.scaleFitNative + dragVec.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(center.x * sp.scaleFitNative + dragVec.x, center.y * sp.scaleFitNative + dragVec.y);
        ctx.lineTo(
            center.x * sp.scaleFitNative + dragVec.x - headLen * Math.cos(angle + Math.PI / 6),
            center.y * sp.scaleFitNative + dragVec.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }

    // Draw slime
    slime.draw(ctx!, sp!);
}

// MARK: Game Loop
let lastTime = 0;
function gameLoop(timestamp: number) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if (keys.get(" ")) { // Only update when spacebar is pressed
        update(deltaTime);
    }
    draw();
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