import "./style.css";

const nativeWidth = 1920;
const nativeHeight = 1080;
const keys: Map<string, boolean> = new Map<string, boolean>();
let canvas: HTMLCanvasElement | null;
let ctx: CanvasRenderingContext2D | null;
let sp: ScreenParams  | null;
const PlayerSubCircleRadius = 40
const player: Player = createPlayer()

let dragStart: Point | null = null
let currentDragPos: Point | null = null


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
    console.log(scaleFitNative)
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
    ctx.fillRect(sp.offSetToNativeLeft, sp.offSetToNativeTop, nativeWidth * sp.scaleFitNative, nativeHeight * sp.scaleFitNative)

    ctx.beginPath();
    ctx.arc(player.center.x * sp.scaleFitNative, player.center.y * sp.scaleFitNative, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

    // Draw the circles
    player.coords.forEach((coord) => {
        ctx.beginPath();
        ctx.arc(coord.x * sp.scaleFitNative, coord.y * sp.scaleFitNative, PlayerSubCircleRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = "blue";
        ctx.stroke();
    });
    
}

// MARK: Game Loop
function gameLoop() {
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
    requestAnimationFrame(gameLoop);
}


interface Point {
    x: number,
    y: number,
}

interface Player {
    radius: number,
    coords: Point[]
    center: Point
}

function createPlayer(): Player {
    const radius = 60
    const center: Point = { x: 0, y: 0 };
    const coords: Point[] = [];

    const numberOfCircles = 8;
    const angleIncrement = (2 * Math.PI) / numberOfCircles;

    for (let i = 0; i < numberOfCircles; i++) {
        const angle = i * angleIncrement;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        coords.push({ x, y });
    }
    console.log(coords)
    return { radius, coords, center };
}