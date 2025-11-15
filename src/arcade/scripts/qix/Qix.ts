/// <reference path="../gameObjects/GameObject.ts" />

enum QixState {
    Home,
    Ready,
    Playing,
    Paused,
    Victory,
    GameOver
}

class Qix extends GameObject {

    public qixState: QixState = QixState.Home;

    public homeBackground: RectGameObject;
    public homeLogo: PictureGameObject;
    public homeAuthor: TextGameObject;
    public homeText: TextGameObject;

    public map: QixMap;
    public player: QixPlayer;
    public creeps: QixCreep[] = [];
    public level: number = 1;
    public lives: number = 3;

    public score: number = 0;
    public scoreDisplay: TextGameObject;
    public areaDisplay: TextGameObject;
    public livesDisplay: PictureGameObject[] = [];
    public successText: TextGameObject;
    public gameOverText: TextGameObject;
    public nextText: TextGameObject;

    public hitSound: HTMLAudioElement;

    constructor(public engine: ArcadeEngine) {
        super("qix", engine);

        this.homeBackground = new RectGameObject("home-bg", this.engine, this.engine.w, this.engine.h, ArcadeEngineColor.Turquoise, FillStyle.Grid);
        this.homeBackground.layer = 4;

        this.homeLogo = new PictureGameObject("home.png", this.engine);
        this.homeLogo.position.y = 10;
        this.homeLogo.layer = 5;
        
        this.homeAuthor = new TextGameObject("PRESS START TO ENTER", ArcadeEngineColor.White, this.engine);
        this.homeAuthor.layer = 6;
        this.homeAuthor.textAlign = TextAlign.Center;
        this.homeAuthor.position.x = 80;
        this.homeAuthor.position.y = 116;
        this.homeAuthor.backgroundColor = ArcadeEngineColor.Black;
        
        this.homeText = new TextGameObject("MADE BY SVEN", ArcadeEngineColor.Green, this.engine);
        this.homeText.layer = 6;
        this.homeText.textAlign = TextAlign.Right;
        this.homeText.position.x = 158;
        this.homeText.position.y = 134;
        this.homeText.backgroundColor = ArcadeEngineColor.Black;
        
        this.scoreDisplay = new TextGameObject("SCORE 000", ArcadeEngineColor.White, this.engine);
        this.scoreDisplay.position.x = 1;
        this.scoreDisplay.position.y = 1;
        this.scoreDisplay.backgroundColor = ArcadeEngineColor.Black;
        this.incScore(0);

        this.areaDisplay = new TextGameObject("AREA 00000", ArcadeEngineColor.Black, this.engine);
        this.areaDisplay.position.x = 90;
        this.areaDisplay.position.y = 1;
        this.areaDisplay.backgroundColor = ArcadeEngineColor.Marine;

        for (let i = 0; i < 5; i++) {
            let lifeDisplay = new PictureGameObject("heart.png", this.engine);
            lifeDisplay.position.x = 160 - 8 * (i + 1);
            lifeDisplay.position.y = 1;
            lifeDisplay.layer = 5;
            this.livesDisplay[i] = lifeDisplay;
        }
        
        this.successText = new TextGameObject("SUCCESS", ArcadeEngineColor.White, this.engine);
        this.successText.layer = 5;
        this.successText.position.x = 50;
        this.successText.position.y = 66;
        this.successText.backgroundColor = ArcadeEngineColor.Black;
        
        this.gameOverText = new TextGameObject("GAME OVER", ArcadeEngineColor.Red, this.engine);
        this.gameOverText.layer = 5;
        this.gameOverText.position.x = 50;
        this.gameOverText.position.y = 66;
        this.gameOverText.backgroundColor = ArcadeEngineColor.Black;
        
        this.nextText = new TextGameObject("PRESS START TO RESTART", ArcadeEngineColor.White, this.engine);
        this.nextText.layer = 6;
        this.nextText.textAlign = TextAlign.Center;
        this.nextText.position.x = 80;
        this.nextText.position.y = 90;
        this.nextText.backgroundColor = ArcadeEngineColor.Black;

        this.hitSound = document.createElement("audio");
        this.hitSound.src = "sounds/laserLarge_000.ogg";

        this.map = new QixMap(this);

        this.player = new QixPlayer(this);
        this.creeps = [];
    }

    public initialize(): void {
        this.level = 1;
        this.lives = 3;
        this.score = 0;

        this.setState(QixState.Home);
    }

    public setState(state: QixState): void {
        this.qixState = state;

        if (this.qixState === QixState.GameOver) {
            this.nextText.text = "PRESS START TO EXIT";
        }
        else if (this.qixState === QixState.Victory) {
            this.nextText.text = "PRESS START TO PLAY";
        }

        this.homeBackground.isVisible = this.qixState === QixState.Home;
        this.homeLogo.isVisible = this.qixState === QixState.Home;
        this.homeAuthor.isVisible = this.qixState === QixState.Home;
        this.homeText.isVisible = this.qixState === QixState.Home;

        this.map.isVisible = this.qixState >= QixState.Ready;
        this.player.isVisible = this.qixState >= QixState.Ready;
        this.creeps.forEach(creep => {
            creep.isVisible = this.qixState >= QixState.Ready;
        })
        this.scoreDisplay.isVisible = this.qixState >= QixState.Ready;
        this.livesDisplay.forEach((lifeDisplay, i) => {
            lifeDisplay.blinking = false;
            lifeDisplay.isVisible = i < this.lives && this.qixState >= QixState.Ready;
        })
        this.areaDisplay.isVisible = false;

        this.successText.isVisible = this.qixState === QixState.Victory;
        this.gameOverText.isVisible = this.qixState === QixState.GameOver;
        
        this.nextText.isVisible = this.qixState === QixState.GameOver || this.qixState === QixState.Victory;
    }

    public initializeGame(): void {
        this.map.initialize();
        this.player.initialize();
        while (this.creeps.length > 0) {
            this.creeps.pop().dispose();
        }
        for (let n = 0; n < this.level; n++) {
            let creep = new QixCreep(this);
            creep.position.x = Math.random() * (this.map.max.x - 10) + 5;
            creep.position.y = Math.random() * (this.map.max.y - 10) + 5;
            this.creeps.push(creep);
        }
        this.setState(QixState.Ready);
        this.incScore(0);
    }

    public start(): void {
        this.setState(QixState.Playing);
    }

    public win(): void {
        this.incScore(this.level * 100);
        this.level++;
        this.setState(QixState.Victory);
    }

    public hit(): void {
        this.hitSound.play();
        this.lives--;
        this.setState(QixState.Paused);
        if (this.livesDisplay[this.lives]) {
            this.livesDisplay[this.lives].blinking = true;
        }
        this.player.blinking = true;
        setTimeout(() => {
            if (this.lives >= 0) {
                this.initializeGame();
            }
            else {
                this.player.blinking = false;
                this.gameOver();
            }
        }, 1000);
    }

    public gameOver(): void {
        this.level = Math.max(this.level - 1, 1);
        this.setState(QixState.GameOver);
    }

    public incScore(amount: number = 0): void {
        this.score += amount;
        this.scoreDisplay.text = this.score.toFixed(0).padStart(5, "0") + " LVL " + this.level.toFixed(0);
    }

    public update(dt?: number): void {
        if (this.qixState === QixState.Home) {
            if (this.engine.input.UpUp) {
                this.initializeGame();
            }
        }
        if (this.qixState === QixState.Victory) {
            if (this.engine.input.UpUp) {
                this.initializeGame();
            }
        }
        if (this.qixState === QixState.GameOver) {
            if (this.engine.input.UpUp) {
                this.initialize();
            }
        }
    }
}

class QixPlayer extends GameObject {

    public movingOnMap: number = 0;
    public tracing: boolean = false;
    public tracingDir: Vec2 = Vec2.Zero();
    public tracePath: Vec2[] = [];

    public color: ArcadeEngineColor = ArcadeEngineColor.Lime;
    public blinking: boolean = false;
    public blinkingCD: number = 0;

    public tracingSound: HTMLAudioElement;
    public tracingSoundPlaying: boolean = false;

    public get map(): QixMap {
        return this.qix.map;
    }

    constructor(public qix: Qix) {
        super("qix-player", qix.engine);
        this.layer = 4;

        this.tracingSound = document.createElement("audio");
        this.tracingSound.src = "sounds/spaceEngine_003.ogg";
        this.tracingSound.loop = true;
    }

    public initialize(): void {
        this.position.copyFrom(this.map.points[0]);
        this.blinking = false;
        this.color = ArcadeEngineColor.Lime;
        this.tracing = false;
        this.tracePath = [];

        this.tracingSound.pause();
        this.tracingSoundPlaying = false;
    }

    public indexOnMap(): number {
        for (let i = 0; i < this.map.points.length; i++) {
            let s1 = this.map.points[i];
            let s2 = this.map.points[(i + 1) % this.map.points.length];
            if (this.position.equals(s2)) {
                return (i + 1) % this.map.points.length;
            }
            if (this.position.isOnRectSegment(s1, s2)) {
                return i;
            }
        }
        return -1;
    }

    public getDir(index: number): Vec2 {
        while (index < 0) {
            index += this.map.points.length;
        }
        while (index >= this.map.points.length) {
            index -= this.map.points.length;
        }

        let s1 = this.map.points[index];
        let s2 = this.map.points[(index + 1) % this.map.points.length];

        return s2.subtract(s1).normalizeInPlace();
    }

    public getDirInv(index: number): Vec2 {
        while (index < 0) {
            index += this.map.points.length;
        }
        while (index >= this.map.points.length) {
            index -= this.map.points.length;
        }

        let s1 = this.map.points[index];
        if (this.position.equals(s1)) {
            return this.getDir(index - 1).scaleInPlace(-1);
        }
        return this.getDir(index).scaleInPlace(-1);
    }

    public update(dt?: number): void {
        if (this.qix.qixState === QixState.Ready) {
            if (this.engine.input.Up || this.engine.input.Down || this.engine.input.Right || this.engine.input.Left) {
                this.qix.start();
            }
        }

        if (this.blinking) {
            this.blinkingCD--;
            if (this.blinkingCD <= 0) {
                if (this.color === ArcadeEngineColor.Lime) {
                    this.color = ArcadeEngineColor.Red;
                }
                else {
                    this.color = ArcadeEngineColor.Lime;
                }
                this.blinkingCD = 4;
            }
        }

        if (this.qix.qixState != QixState.Playing) {
            this.tracingSound.pause();
            this.tracingSound.currentTime = 0;
            this.tracingSoundPlaying = false;
            return;
        }

        for (let n = 0; n < 1; n++) {
            if (this.movingOnMap != 0) {
                this.tracingSound.pause();
                this.tracingSound.currentTime = 0;
                this.tracingSoundPlaying = false;
                if (this.engine.input.Up || this.engine.input.Down || this.engine.input.Right || this.engine.input.Left) {
                    let index = this.indexOnMap();
                    if (index === -1) {
                        this.position.copyFrom(this.map.points[0]);
                        return;
                    }

                    if (this.movingOnMap === 1) {
                        let dir = this.getDir(index);
                        this.position.addInPlace(dir);
                    }
                    else if (this.movingOnMap = -1) {
                        let dir = this.getDirInv(index);
                        this.position.addInPlace(dir);
                    }
                }
                else {
                    this.movingOnMap = 0;
                }
            }
            else if (this.tracing) {
                if (!this.tracingSoundPlaying) {
                    this.tracingSoundPlaying = true;
                    this.tracingSound.play();
                }
                if (this.engine.input.Up && !this.tracingDir.equals(Vec2.AxisUp) && !this.tracingDir.equals(Vec2.AxisDown)) {
                    this.tracingDir.copyFrom(Vec2.AxisUp);
                    this.tracePath.push(this.position.clone());
                }
                else if (this.engine.input.Down && !this.tracingDir.equals(Vec2.AxisDown) && !this.tracingDir.equals(Vec2.AxisUp)) {
                    this.tracingDir.copyFrom(Vec2.AxisDown);
                    this.tracePath.push(this.position.clone());
                }
                else if (this.engine.input.Right && !this.tracingDir.equals(Vec2.AxisRight) && !this.tracingDir.equals(Vec2.AxisLeft)) {
                    this.tracingDir.copyFrom(Vec2.AxisRight);
                    this.tracePath.push(this.position.clone());
                }
                else if (this.engine.input.Left && !this.tracingDir.equals(Vec2.AxisLeft) && !this.tracingDir.equals(Vec2.AxisRight)) {
                    this.tracingDir.copyFrom(Vec2.AxisLeft);
                    this.tracePath.push(this.position.clone());
                }
                this.position.addInPlace(this.tracingDir);
                if (this.position.isOnRectPath(this.tracePath) != -1) {
                    this.qix.hit();
                    return;
                }
                if (this.indexOnMap() != -1) {
                    this.tracePath.push(this.position.clone());
                    this.map.split(this.tracePath);
                    this.tracing = false;
                }
            }
            else {
                this.tracingSound.pause();
                this.tracingSound.currentTime = 0;
                this.tracingSoundPlaying = false;
                let index = this.indexOnMap();
                if (index === -1) {
                    this.position.copyFrom(this.map.points[0]);
                    return;
                }
                
                let dir = this.getDir(index);
                if (dir.equals(Vec2.AxisUp) && this.engine.input.Up) {
                    this.movingOnMap = 1;
                }
                else if (dir.equals(Vec2.AxisDown) && this.engine.input.Down) {
                    this.movingOnMap = 1;
                }
                else if (dir.equals(Vec2.AxisRight) && this.engine.input.Right) {
                    this.movingOnMap = 1;
                }
                else if (dir.equals(Vec2.AxisLeft) && this.engine.input.Left) {
                    this.movingOnMap = 1;
                }

                let dirInv = this.getDirInv(index);
                if (dirInv.equals(Vec2.AxisUp) && this.engine.input.Up) {
                    this.movingOnMap = - 1;
                }
                else if (dirInv.equals(Vec2.AxisDown) && this.engine.input.Down) {
                    this.movingOnMap = - 1;
                }
                else if (dirInv.equals(Vec2.AxisRight) && this.engine.input.Right) {
                    this.movingOnMap = - 1;
                }
                else if (dirInv.equals(Vec2.AxisLeft) && this.engine.input.Left) {
                    this.movingOnMap = - 1;
                }

                let inputDir = Vec2.Zero();
                if (this.engine.input.Up) {
                    let angle = dir.angleTo(Vec2.AxisUp);
                    if (angle > 0) {
                        let angleInv = Vec2.AxisUp.angleTo(dirInv);
                        if (angleInv > 0) {
                            this.tracing = true;
                            this.tracingDir = Vec2.AxisUp.clone();
                            this.tracePath = [this.position.clone()];
                        }
                    }
                }
                if (this.engine.input.Down) {
                    let angle = dir.angleTo(Vec2.AxisDown);
                    if (angle > 0) {
                        let angleInv = Vec2.AxisDown.angleTo(dirInv);
                        if (angleInv > 0) {
                            this.tracing = true;
                            this.tracingDir = Vec2.AxisDown.clone();
                            this.tracePath = [this.position.clone()];
                        }
                    }
                }
                if (this.engine.input.Right) {
                    let angle = dir.angleTo(Vec2.AxisRight);
                    if (angle > 0) {
                        let angleInv = Vec2.AxisRight.angleTo(dirInv);
                        if (angleInv > 0) {
                            this.tracing = true;
                            this.tracingDir = Vec2.AxisRight.clone();
                            this.tracePath = [this.position.clone()];
                        }
                    }
                }
                if (this.engine.input.Left) {
                    let angle = dir.angleTo(Vec2.AxisLeft);
                    if (angle > 0) {
                        let angleInv = Vec2.AxisLeft.angleTo(dirInv);
                        if (angleInv > 0) {
                            this.tracing = true;
                            this.tracingDir = Vec2.AxisLeft.clone();
                            this.tracePath = [this.position.clone()];
                        }
                    }
                }
            }
        }
    }

    public draw(): void {
        if (this.tracing) {
            for (let i = 0; i < this.tracePath.length; i++) {
                let start = this.tracePath[i];
                let end: Vec2;
                if (this.tracing && i === this.tracePath.length - 1) {
                    end = this.position;
                }
                else if (i < this.tracePath.length - 1) {
                    end = this.tracePath[i + 1];
                }

                if (end) {
                    this.engine.drawLine(start, end, this.color, this.map.position);
                }
            }
        }

        this.engine.drawRect(-2, -2, 5, 5, this.color, this.position.add(this.map.position));
    }
}

