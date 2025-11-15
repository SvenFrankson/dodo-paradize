class Vec2 {

    public static Zero(): Vec2 {
        return new Vec2(0, 0);
    }

    private static _AxisUp: Vec2 = new Vec2(0, - 1);
    public static get AxisUp(): Vec2 {
        return this._AxisUp;
    }

    private static _AxisDown: Vec2 = new Vec2(0, 1);
    public static get AxisDown(): Vec2 {
        return this._AxisDown;
    }

    private static _AxisRight: Vec2 = new Vec2(1, 0);
    public static get AxisRight(): Vec2 {
        return this._AxisRight;
    }

    private static _AxisLeft: Vec2 = new Vec2(- 1, 0);
    public static get AxisLeft(): Vec2 {
        return this._AxisLeft;
    }

    constructor(public x: number, public y: number) {
        
    }

    public copyFrom(other: Vec2): Vec2 {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    public clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    public sqrLength(): number {
        return this.x * this.x + this.y * this.y;
    }

    public length(): number {
        return Math.sqrt(this.sqrLength());
    }

    public normalizeInPlace(): Vec2 {
        let l = this.length();
        this.x = this.x / l;
        this.y = this.y / l;
        return this;
    }

    public normalize(): Vec2 {
        return this.clone().normalizeInPlace();
    }

    public minimizeInPlace(other: Vec2): Vec2 {
        this.x = Math.min(this.x, other.x);
        this.y = Math.min(this.y, other.y);
        return this;
    }

    public minimize(other: Vec2): Vec2 {
        return this.clone().minimizeInPlace(other);
    }

    public maximizeInPlace(other: Vec2): Vec2 {
        this.x = Math.max(this.x, other.x);
        this.y = Math.max(this.y, other.y);
        return this;
    }

    public maximize(other: Vec2): Vec2 {
        return this.clone().maximizeInPlace(other);
    }

    public clampInPlace(xMin: number, xMax: number, yMin: number, yMax: number): Vec2 {
        this.x = Math.min(Math.max(this.x, xMin), xMax);
        this.y = Math.min(Math.max(this.y, yMin), yMax);
        return this;
    }

    public scaleInPlace(s: number): Vec2 {
        this.x = this.x * s;
        this.y = this.y * s;
        return this;
    }

    public scale(s: number): Vec2 {
        return this.clone().scaleInPlace(s);
    }

    public addInPlace(other: Vec2): Vec2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    public add(other: Vec2): Vec2 {
        return this.clone().addInPlace(other);
    }

    public subtractInPlace(other: Vec2): Vec2 {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    public subtract(other: Vec2): Vec2 {
        return this.clone().subtractInPlace(other);
    }

    public lerpInPlace(other: Vec2, f: number): Vec2 {
        this.x = this.x * (1 - f) + other.x * f;
        this.y = this.y * (1 - f) + other.y * f;
        return this;
    }

    public lerp(other: Vec2, f: number): Vec2 {
        return this.clone().lerpInPlace(other, f);
    }

    public dot(other: Vec2): number {
        return this.x * other.x + this.y * other.y;
    }

    public cross(other: Vec2): number {
        return this.x * other.y - this.y * other.x;
    }

    public roundInPlace(): Vec2 {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    public round(): Vec2 {
        return this.clone().roundInPlace();
    }

    public floorInPlace(): Vec2 {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    public floor(): Vec2 {
        return this.clone().floorInPlace();
    }

    public ceilInPlace(): Vec2 {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }

    public ceil(): Vec2 {
        return this.clone().ceilInPlace();
    }

    public isOnRectSegment(s1: Vec2, s2: Vec2): boolean {
        if (this.x === s1.x && this.x === s2.x) {
            let minY = Math.min(s1.y, s2.y);
            let maxY = Math.max(s1.y, s2.y);
            return this.y >= minY && this.y <= maxY;
        }
        if (this.y === s1.y && this.y === s2.y) {
            let minX = Math.min(s1.x, s2.x);
            let maxX = Math.max(s1.x, s2.x);
            return this.x >= minX && this.x <= maxX;
        }
        return false;
    }

    public isOnRectPath(path: Vec2[]): number {
        for (let i = 0; i < path.length - 1; i++) {
            let p1 = path[i];
            let p2 = path[i + 1];
            if (this.isOnRectSegment(p1, p2)) {
                return i;
            }
        }
        return -1;
    }

    public equals(other: Vec2): boolean {
        return Math.abs(this.x - other.x) < 0.001 && Math.abs(this.y - other.y) < 0.001;
    }

    public angleTo(other: Vec2): number {
        return Math.atan2(this.x * other.y - this.y * other.x, this.x * other.x + this.y * other.y);
    }

    public rotateInPlace(angle: number): Vec2 {
        let x = this.x;
        let y = this.y;
        let cosa = Math.cos(angle);
        let sina = Math.sin(angle);

        this.x = x * cosa - y * sina;
        this.y = x * sina + y * cosa;

        return this;
    }
}