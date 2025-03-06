import { ScreenParams, Vector2 } from "./types";
import { getAngle, getDifferenceVector, getDistance, getMagnitude, getPerpendicularVector, normalizeVector } from "./utils";

const SlimeParticleRadius = 10;

class SlimeParticle {
    position: Vector2;
    velocity: Vector2;
    radius: number;
    mass: number;

    constructor(x: number, y: number, radius: number, mass: number = 1) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.radius = radius;
        this.mass = mass;
    }
}

export class Slime {
    private particles: SlimeParticle[];
    private centerPosition: Vector2;
    private centerSpringConstant: number;
    private centerSpringDamping: number;
    private angularSpringConstant: number;
    private angularSpringDamping: number;
    private restLength: number;
    private numberOfParticles: number;

    constructor(centerX: number, centerY: number, radius: number, numberOfParticles: number = 8) {
        this.centerPosition = { x: centerX, y: centerY };
        this.centerSpringConstant = 5000;
        this.centerSpringDamping = 0.9;
        this.angularSpringConstant = 5000;
        this.angularSpringDamping = 0.9;
        this.restLength = radius;
        this.particles = [];
        this.numberOfParticles = numberOfParticles;
        
        // Create 8 particles in a circle
        for (let i = 0; i < numberOfParticles; i++) {
            const angle = (i / numberOfParticles) * Math.PI * 2 + Math.PI / numberOfParticles;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            this.particles.push(new SlimeParticle(x, y, SlimeParticleRadius));
        }
    }

    update(deltaTime: number, sp: ScreenParams) {
        const restitution = 0.7;
        const dt = Math.min(deltaTime / 1000, 0.016);
        
        this.particles.forEach((particle, index) => {
            // const centerDiff = getDifferenceVector(particle.position, this.centerPosition)
            // const centerDiffMagnitude = getMagnitude(centerDiff)
            // const centerDiffNormalized = normalizeVector(centerDiff)
            // if (centerDiffMagnitude != 0) {
            //     const centerSpringForceX = (centerDiffNormalized.x / centerDiffMagnitude) * this.centerSpringConstant
            //     const centerSpringForceY = (centerDiffNormalized.y / centerDiffMagnitude) * this.centerSpringConstant
                
            //     this.particles[index].velocity.x += (centerSpringForceX) * dt * this.centerSpringDamping;
            //     this.particles[index].velocity.y += (centerSpringForceY) * dt * this.centerSpringDamping;
            // }

            const desiredAngle = index * (2 * Math.PI) / this.numberOfParticles + Math.PI / this.numberOfParticles;
            console.log("Desired Angle: ", desiredAngle / (Math.PI * 2), "Index: ", index)
            const desiredX = this.centerPosition.x + Math.cos(desiredAngle) * this.restLength;
            const desiredY = this.centerPosition.y + Math.sin(desiredAngle) * this.restLength;
            const xDiff = desiredX - particle.position.x;
            const yDiff = desiredY - particle.position.y;
            const magnitude = getMagnitude({x: xDiff, y: yDiff})
            
            // Avoid division by zero
            if (magnitude != 0) {
                console.log("Magnitude: ", magnitude, ", X Diff: ", xDiff, ", Y Diff: ", yDiff)
                const springForceX = (xDiff / magnitude) * this.centerSpringConstant;
                const springForceY = (yDiff / magnitude) * this.centerSpringConstant;
                console.log("Spring Force: ", springForceX, springForceY, "Spring Constant: ", this.centerSpringConstant)

                // Apply all forces with appropriate damping
                this.particles[index].velocity.x += (springForceX) * dt * this.centerSpringDamping;
                this.particles[index].velocity.y += (springForceY) * dt * this.centerSpringDamping;
                console.log("x: ", (springForceX) * dt * this.centerSpringDamping, "y: ", (springForceY) * dt * this.centerSpringDamping)
            } else {
                console.log("Magnitude is 0")
            }   
            // Apply gravity (undampened)
            const gravity = 1000;
            this.particles[index].velocity.y += gravity * dt;

            // Update positions
            this.particles[index].position.x += this.particles[index].velocity.x * dt;
            this.particles[index].position.y += this.particles[index].velocity.y * dt;

            // Friction
            const friction = 0.99;
            this.particles[index].velocity.x *= friction;
            this.particles[index].velocity.y *= friction;

            // Handle collisions
            const scaledY = this.particles[index].position.y * sp!.scaleFitNative;
            const scaledRadius = this.particles[index].radius * sp!.scaleFitNative;
            
            if (scaledY + scaledRadius > -sp!.offSetToNativeTop) {
                this.particles[index].position.y = (-sp!.offSetToNativeTop / sp!.scaleFitNative) - this.particles[index].radius;
                this.particles[index].velocity.y = -this.particles[index].velocity.y * restitution;
            } else if (scaledY - scaledRadius < sp!.offSetToNativeTop) {
                this.particles[index].position.y = (sp!.offSetToNativeTop / sp!.scaleFitNative) + this.particles[index].radius;
                this.particles[index].velocity.y = -this.particles[index].velocity.y * restitution;
            }
        })

        // calculate center position
        let newCenterX = 0;
        let newCenterY = 0;
        this.particles.forEach(particle => {
            newCenterX += particle.position.x;
            newCenterY += particle.position.y;
        });

        // gradually move center to new center
        this.centerPosition.x += (newCenterX / this.numberOfParticles - this.centerPosition.x) * 0.8;
        this.centerPosition.y += (newCenterY / this.numberOfParticles - this.centerPosition.y) * 0.8;
    }

    draw(ctx: CanvasRenderingContext2D, sp: ScreenParams) {
        
        ctx.beginPath();
        const firstParticle = this.particles[0];
        const angleFirstParticle = getAngle(this.centerPosition, firstParticle.position);
        const angleLeft = angleFirstParticle + Math.PI / 2;
        const angleRight = angleFirstParticle - Math.PI / 2;
        ctx.moveTo((firstParticle.position.x + Math.cos(angleLeft) + Math.cos(angleFirstParticle) * firstParticle.radius) * sp!.scaleFitNative, (firstParticle.position.y + Math.sin(angleLeft) + Math.sin(angleFirstParticle) * firstParticle.radius) * sp!.scaleFitNative);
        ctx.lineTo((firstParticle.position.x + Math.cos(angleRight) +   Math.cos(angleFirstParticle) * firstParticle.radius) * sp!.scaleFitNative, (firstParticle.position.y + Math.sin(angleRight) + Math.sin(angleFirstParticle) * firstParticle.radius) * sp!.scaleFitNative);
        this.particles.forEach((particle, index) => {
            if (index != 0) {
                const angle = getAngle(this.centerPosition, particle.position);
                const angleLeft = angle + Math.PI / 2;
                const angleRight = angle - Math.PI / 2;
                ctx.lineTo((particle.position.x + Math.cos(angleLeft) + Math.cos(angle) * particle.radius) * sp!.scaleFitNative, (particle.position.y + Math.sin(angleLeft) + Math.sin(angle) * particle.radius) * sp!.scaleFitNative);
                ctx.lineTo((particle.position.x + Math.cos(angleRight) + Math.cos(angle) * particle.radius) * sp!.scaleFitNative, (particle.position.y + Math.sin(angleRight) + Math.sin(angle) * particle.radius) * sp!.scaleFitNative);
            }
        })
        ctx.fillStyle = "green";
        ctx.closePath();
        ctx.fill();

        // Draw the circles
        ctx.lineWidth = 2;
        this.particles.forEach((particle) => {
            ctx!.beginPath();
            ctx!.arc(particle.position.x * sp!.scaleFitNative, particle.position.y * sp!.scaleFitNative, particle.radius, 0, 2 * Math.PI);
            ctx!.fillStyle = "green";
            ctx!.fill();
        });
    }

    jump(jumpVector: Vector2, sp: ScreenParams) {
        this.particles.forEach(particle => {
            particle.velocity.x += jumpVector.x * (1 / sp!.scaleFitNative);
            particle.velocity.y += jumpVector.y * (1 / sp!.scaleFitNative);
        })
    }

    moveLeft(sp: ScreenParams) {
        this.particles.forEach(particle => {
            particle.velocity.x -= 100 * (1 / sp!.scaleFitNative);
        })
    }

    moveRight(sp: ScreenParams) {
        this.particles.forEach(particle => {
            particle.velocity.x += 100 * (1 / sp!.scaleFitNative);
        })
    }

    getCenterPosition(): Vector2 {
        return this.centerPosition;
    }
    
}