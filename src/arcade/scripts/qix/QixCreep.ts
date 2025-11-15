class QixCreep extends GameObject {

    private _dir: Vec2 = Vec2.Zero();

    public bounceSounds: HTMLAudioElement[];
    public bounceSoundIndex: number = 0;

    public get map(): QixMap {
        return this.qix.map;
    }

    constructor(public qix: Qix) {
        super("creep", qix.engine);
        this.layer = 4;
        this._dir.x = - 0.5 + Math.random();
        this._dir.y = - 0.5 + Math.random();
        this._dir.normalizeInPlace();

        this.bounceSounds = [];
        this.bounceSounds[0] = document.createElement("audio");
        this.bounceSounds[0].src = "sounds/impactMetal_000.ogg";
        this.bounceSounds[1] = document.createElement("audio");
        this.bounceSounds[1].src = "sounds/impactMetal_000.ogg";
    }

    public update(): void {
        if (this.qix.qixState != QixState.Playing) {
            return;
        }

        for (let steps = 0; steps < 1; steps++) {
            this.position.addInPlace(this._dir);
            let roundedPos = this.roundedPosition;
            if (this.qix.player.tracing) {
                if (this.qix.player.tracePath.length >= 2) {
                    if (roundedPos.isOnRectPath(this.qix.player.tracePath) != -1) {
                        this.qix.hit();
                        return;
                    }
                }
                if (this.qix.player.tracePath.length > 0) {
                    if (roundedPos.isOnRectSegment(this.qix.player.tracePath[this.qix.player.tracePath.length - 1], this.qix.player.position)) {
                        this.qix.hit();
                        return;
                    }
                }
            }
            for (let i = 0; i < this.map.points.length; i++) {
                let l = this.map.points.length;
                let p1 = this.map.points[i];
                let p2 = this.map.points[(i + 1) % l];

                if (roundedPos.isOnRectSegment(p1, p2)) {
                    let n = p2.subtract(p1).normalizeInPlace().rotateInPlace(Math.PI / 2);
                    if (n.equals(Vec2.AxisLeft)) {
                        this.bounceSounds[this.bounceSoundIndex].play();
                        this.bounceSoundIndex = (this.bounceSoundIndex + 1) % 2;
                        this._dir.x = - Math.abs(this._dir.x);
                        this._dir.y += - 0.2 + 0.4 * Math.random();
                        this._dir.normalizeInPlace();
                    }
                    else if (n.equals(Vec2.AxisRight)) {
                        this.bounceSounds[this.bounceSoundIndex].play();
                        this.bounceSoundIndex = (this.bounceSoundIndex + 1) % 2;
                        this._dir.x = Math.abs(this._dir.x);
                        this._dir.y += - 0.2 + 0.4 * Math.random();
                        this._dir.normalizeInPlace();
                    }
                    else if (n.equals(Vec2.AxisUp)) {
                        this.bounceSounds[this.bounceSoundIndex].play();
                        this.bounceSoundIndex = (this.bounceSoundIndex + 1) % 2;
                        this._dir.y = - Math.abs(this._dir.y);
                        this._dir.x += - 0.2 + 0.4 * Math.random();
                        this._dir.normalizeInPlace();
                    }
                    else if (n.equals(Vec2.AxisDown)) {
                        this.bounceSounds[this.bounceSoundIndex].play();
                        this.bounceSoundIndex = (this.bounceSoundIndex + 1) % 2;
                        this._dir.y = Math.abs(this._dir.y);
                        this._dir.x += - 0.2 + 0.4 * Math.random();
                        this._dir.normalizeInPlace();
                    }
                }
            }
        }
    }

    public draw(): void {
        this.engine.drawRect(-2, -2, 5, 5, ArcadeEngineColor.Red, this.position.add(this.map.position));
        this.engine.drawRect(-1, -1, 3, 3, ArcadeEngineColor.Black, this.position.add(this.map.position));
    }
}