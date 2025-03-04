import { initBuffers } from "./initBuffers.ts"
import { drawScene } from "./drawScene.ts";
import {fetchShaderTexts} from "./fetchShaderTexts.ts"

main();

//
// start here
//
function main() {
    console.log(fetchShaderTexts("fragmentShader.glsl", "vertexShader.glsl"))
//   const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement
//   // Initialize the GL context
//   const gl = canvas.getContext("webgl");

//   // Only continue if WebGL is available and working
//   if (gl === null) {
//     alert(
//       "Unable to initialize WebGL. Your browser or machine may not support it."
//     );
//     return;
//   }

//   // Set clear color to black, fully opaque
//   gl.clearColor(0.0, 0.0, 0.0, 1.0);
//   // Clear the color buffer with specified clear color
//   gl.clear(gl.COLOR_BUFFER_BIT);

//   // Vertex shader program
//   const vsSource = `
//     attribute vec4 aVertexPosition;
//     uniform mat4 uModelViewMatrix;
//     uniform mat4 uProjectionMatrix;
//     void main() {
//       gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
//     }
// `;

//   const fsSource = `
//     void main() {
//       gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
//     }
//   `;

//   // Initialize a shader program; this is where all the lighting
//   // for the vertices and so forth is established.
//   const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
//   if (shaderProgram == null) {
//     console.error("Error loading shader program")
//     return
//   }

//   // Collect all the info needed to use the shader program.
//   // Look up which attribute our shader program is using
//   // for aVertexPosition and look up uniform locations.
//   const programInfo = {
//     program: shaderProgram,
//     attribLocations: {
//       vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
//     },
//     uniformLocations: {
//       projectionMatrix: gl.getUniformLocation(
//         shaderProgram,
//         "uProjectionMatrix"
//       ),
//       modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
//     },
//   };

//   // Here's where we call the routine that builds all the
//   // objects we'll be drawing.
//   const buffers = initBuffers(gl);

//   // Draw the scene
//   drawScene(gl, programInfo, buffers);
// }

// //
// // Initialize a shader program, so WebGL knows how to draw our data
// //
// function initShaderProgram(gl: WebGLRenderingContext, vsSource, fsSource) {
//   const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
//   if (vertexShader == null) {
//     console.error("Error initializing vertex shader")
//     return 
//   }
//   const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
//   if (fragmentShader == null) {
//     console.error("Error initializing fragment shader")
//     return 
//   }

//   // Create the shader program
//   const shaderProgram = gl.createProgram();
//   gl.attachShader(shaderProgram, vertexShader);
//   gl.attachShader(shaderProgram, fragmentShader);
//   gl.linkProgram(shaderProgram);

//   // If creating the shader program failed, alert

//   if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
//     console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
//     return null;
//   }

//   return shaderProgram;
// }

// //
// // creates a shader of the given type, uploads the source and
// // compiles it.
// //
// function loadShader(gl: WebGLRenderingContext, type: GLenum, source) {
//   const shader = gl.createShader(type);
//     if (shader == null) {
//         console.error("Error creating shader")
//         return
//     }

//   // Send the source to the shader object
//   gl.shaderSource(shader, source);

//   // Compile the shader program
//   gl.compileShader(shader);

//   // See if it compiled successfully
//   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//     console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
//     gl.deleteShader(shader);
//     return null;
//   }
//   return shader;
}