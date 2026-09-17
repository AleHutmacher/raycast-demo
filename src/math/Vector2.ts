export interface Vector2 { x: number; y: number; }

export const add = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y });
export const subtract = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v: Vector2, amount: number): Vector2 => ({ x: v.x * amount, y: v.y * amount });
export const length = (v: Vector2): number => Math.hypot(v.x, v.y);
export const normalize = (v: Vector2): Vector2 => { const size = length(v); return size === 0 ? { x: 1, y: 0 } : scale(v, 1 / size); };
export const fromAngle = (angle: number): Vector2 => ({ x: Math.cos(angle), y: Math.sin(angle) });
export const rotate = (v: Vector2, angle: number): Vector2 => ({ x: v.x * Math.cos(angle) - v.y * Math.sin(angle), y: v.x * Math.sin(angle) + v.y * Math.cos(angle) });
