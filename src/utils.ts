import { Vector2 } from "./types";

export function normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

export function normalizeVector(vector: Vector2): Vector2 {
    const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    if (length == 0) {
        return { x: 0, y: 0 };
    }
    return { x: vector.x / length, y: vector.y / length };
}

export function getMagnitude(vector: Vector2): number {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
}

export function getDifferenceVector(vector1: Vector2, vector2: Vector2): Vector2 {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y
    }
}

export function getAngle(vector1: Vector2, vector2: Vector2): number {
    return Math.atan2(vector2.y - vector1.y, vector2.x - vector1.x);
}

export function getPerpendicularVector(vector: Vector2, left: boolean = true): Vector2 {
    return {
        x: left ? -vector.y : vector.y,
        y: left ? vector.x : -vector.x
    }
}

export function scaleVector(vector: Vector2, scale: number) {
    return {
        x: vector.x * scale,
        y: vector.y * scale
    }
}

