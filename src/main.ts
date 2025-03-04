import "./style.css";

const nativeWidth = 1920;  // the resolution the games is designed to look best in
const nativeHeight = 1080;

document.addEventListener("DOMContentLoaded", main);

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

function resize(): ScreenParams | null {
    const canvas = document.querySelector("#main-canvas") as HTMLCanvasElement
    if (canvas === null) {
        console.error("Unable to locate `main-canvas`.");
        return null
    }

    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        console.error("Unable to initialize canvas conxtext. Your browser or machine may not support it.");
        return null
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
    var offSetToNativeTop = (-nativeHeight/2)*scaleFitNative;
    var offSetToNativeLeft = (-nativeWidth/2)*scaleFitNative;
    return {
        deviceWidth,
        deviceHeight,
        offSetToNativeTop,
        offSetToNativeLeft,
        scaleFitNative
    }
}

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

    // debug circles
    // ctx.fillStyle = "orange"
    // ctx.beginPath();
    // ctx.arc(sp.offSetToNativeLeft, sp.offSetToNativeTop, 50, 0, 2*Math.PI)
    // ctx.fill()

    // ctx.beginPath();
    // ctx.arc(sp.offSetToNativeLeft, -sp.offSetToNativeTop, 50, 0, 2*Math.PI)
    // ctx.fill()

    // ctx.beginPath();
    // ctx.arc(-sp.offSetToNativeLeft, sp.offSetToNativeTop, 50, 0, 2*Math.PI)
    // ctx.fill()

    // ctx.beginPath();
    // ctx.arc(-sp.offSetToNativeLeft, -sp.offSetToNativeTop, 50, 0, 2*Math.PI)
    // ctx.fill()
}

function gameLoop() {
    draw()
    requestAnimationFrame(gameLoop);
}

let canvas: HTMLCanvasElement | null;
let ctx: CanvasRenderingContext2D | null;
let sp: ScreenParams  | null;
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

    sp = resize()
    if (sp === null) {
        console.error("An error occured while resizing the window.");
        return;
    }
    requestAnimationFrame(gameLoop);
}