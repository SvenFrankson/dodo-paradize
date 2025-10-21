/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>

//mklink /D C:\Users\tgames\OneDrive\Documents\GitHub\fluid-x\lib\nabu\ C:\Users\tgames\OneDrive\Documents\GitHub\nabu

var MAJOR_VERSION: number = 0;
var MINOR_VERSION: number = 0;
var PATCH_VERSION: number = 1;
var VERSION: number = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var CONFIGURATION_VERSION: number = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;

var observed_progress_speed_percent_second;
var setProgressIndex;
var GLOBAL_GAME_LOAD_CURRENT_STEP;
var USE_POKI_SDK: boolean;
var USE_CG_SDK: boolean;
var OFFLINE_MODE: boolean;
var NO_VERTEX_DATA_LOADER: boolean;
var ADVENT_CAL: boolean;
var PokiSDK: any;
var CrazySDK: any;
var LOCALE = "en";
var TOP_HOST: string;

var SDKPlaying: boolean = false;
function SDKGameplayStart(): void {
    if (!SDKPlaying) {
        console.log("SDK Gameplay Start");
        if (USE_POKI_SDK) {
            PokiSDK.gameplayStart();
        }
        else if (USE_CG_SDK) {
            CrazySDK.game.gameplayStart();
        }
        SDKPlaying = true;
    }
}
var CanStartCommercialBreak: boolean = false;
async function PokiCommercialBreak(): Promise<void> {
    if (!CanStartCommercialBreak) {
        return;
    }
    if (location.host.startsWith("127.0.0.1")) {
        return;
    }
    let prevMainVolume = BABYLON.Engine.audioEngine.getGlobalVolume();
    BABYLON.Engine.audioEngine.setGlobalVolume(0);
    await PokiSDK.commercialBreak();
    BABYLON.Engine.audioEngine.setGlobalVolume(prevMainVolume);
}
function SDKGameplayStop(): void {
    if (SDKPlaying) {
        console.log("SDK Gameplay Stop");
        if (USE_POKI_SDK) {
            PokiSDK.gameplayStop();
        }
        else if (USE_CG_SDK) {
            CrazySDK.game.gameplayStop();
        }
        SDKPlaying = false;
    }
}

var PlayerHasInteracted = false;
var IsTouchScreen = -1;
var IsMobile = - 1;
var IsVertical = false;
var HasLocalStorage = false;

function StorageGetItem(key: string): string {
    if (USE_CG_SDK) {
        return CrazySDK.data.getItem(key);
    }
    else {
        return localStorage.getItem(key);
    }
}

function StorageSetItem(key: string, value: string): void {
    if (USE_CG_SDK) {
        CrazySDK.data.setItem(key, value);
    }
    else {
        localStorage.setItem(key, value);
    }
}

var SHARE_SERVICE_PATH: string = "https://dodopolis.tiaratum.com/index.php/";
if (location.host.startsWith("127.0.0.1")) {
    SHARE_SERVICE_PATH = "http://localhost/index.php/";
}

async function WaitPlayerInteraction(): Promise<void> {
    return new Promise<void>(resolve => {
        let wait = () => {
            if (PlayerHasInteracted) {
                resolve();
            }
            else {
                requestAnimationFrame(wait);
            }
        }
        wait();
    })
}

function firstPlayerInteraction(): void {
    Game.Instance.onResize();

    setTimeout(() => {
        document.getElementById("click-anywhere-screen").style.display = "none";
        Game.Instance.soundManager.soundOn();
    }, 300);
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
    PlayerHasInteracted = true;
}

let onFirstPlayerInteractionTouch = (ev: Event) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionTouch");
    ev.stopPropagation();
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);

    IsTouchScreen = 1;
    document.body.classList.add("touchscreen");

    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
}

let onFirstPlayerInteractionClick = (ev: MouseEvent) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    document.body.removeEventListener("click", onFirstPlayerInteractionClick);

    if (IsTouchScreen === -1) {
        IsTouchScreen = 0;
        document.body.classList.remove("touchscreen");
    }
    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
}

let onFirstPlayerInteractionKeyboard = (ev: KeyboardEvent) => {
    if (!ev.code) {
        return;
    }
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionKeyboard");
    ev.stopPropagation();
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    
    if (IsTouchScreen === -1) {
        IsTouchScreen = 0;
        document.body.classList.remove("touchscreen");
    }

    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
}

function addLine(text: string): void {
    let e = document.createElement("div");
    e.classList.add("debug-log");
    e.innerText = text;
    document.body.appendChild(e);
}

function StopPointerProgatation(ev: PointerEvent) {
    ev.stopPropagation();
}

function StopPointerProgatationAndMonkeys(ev: PointerEvent) {
    console.log("StopPointerProgatationAndMonkeys");
    ev.stopPropagation();
}

enum GameMode {
    Home,
    Playing,
}

class Game {
    
    public static Instance: Game;
    public DEBUG_MODE: boolean = true;
    public DEBUG_USE_LOCAL_STORAGE: boolean = true;

    public gameMode: GameMode = GameMode.Home;

	public canvas: HTMLCanvasElement;
    public canvasCurtain: HTMLDivElement;
	public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public getScene(): BABYLON.Scene {
        return this.scene;
    }
    public soundManager: SoundManager;
    public uiInputManager: UserInterfaceInputManager;
    public inputManager: Nabu.InputManager;
    public screenRatio: number = 1;
    public performanceWatcher: PerformanceWatcher;
    public analytics: Analytics;
    public devMode: DevMode;

    public camera: PlayerCamera;

    public light: BABYLON.HemisphericLight;
    public spotlight: BABYLON.SpotLight;
    public animLightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
    public animSpotlightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
    public shadowGenerator: BABYLON.ShadowGenerator;
    public skybox: BABYLON.Mesh;

    public miniatureFactory: MiniatureFactory;
    public noiseTexture: BABYLON.RawTexture3D;
    public vertexDataLoader: Mummu.VertexDataLoader;

    public router: CarillonRouter;

    public gameLoaded: boolean = false;

    public defaultToonMaterial: ToonMaterial;
    public defaultHighlightMaterial: BABYLON.StandardMaterial;
    public configuration: GameConfiguration;
    public networkManager: NetworkManager;
    public homeMenuPlate: HomeMenuPlate;
    public colorPicker: ColorPicker;
    public brickMenuView: BrickMenuView;
    public playerActionView: PlayerActionView;
    public playerInventoryView: PlayerInventoryView;
    public terrain: Terrain;
    public terrainManager: TerrainManager;
    public npcManager: NPCManager;
    public playerDodo: Dodo;
    public playerBrain: Brain;
    public playerBrainPlayer: BrainPlayer;
    public networkDodos: Dodo[];
    public npcDodos: Dodo[];

    constructor(canvasElement: string) {
        Game.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as unknown as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		this.canvasCurtain = document.getElementById("canvas-curtain") as HTMLDivElement;
		this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
		BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        BABYLON.Engine.audioEngine.lock();
        this.soundManager = new SoundManager();
        this.configuration = new GameConfiguration("my-test-configuration", this);
        this.inputManager = new Nabu.InputManager(this.canvas, this.configuration);
        this.configuration.initialize();
        this.configuration.saveToLocalStorage();
        this.inputManager.initializeInputs(this.configuration);
        this.uiInputManager = new UserInterfaceInputManager(this);
        this.performanceWatcher = new PerformanceWatcher(this);
        this.analytics = new Analytics(this);
        this.devMode = new DevMode(this);
	}

    public async createScene(): Promise<void> {
        this.devMode.initialize();

        this.miniatureFactory = new MiniatureFactory(this);
        this.miniatureFactory.initialize();

        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString("#00000000");

        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        if (NO_VERTEX_DATA_LOADER) {
            let datas = await fetch("./datas/meshes/vertexDatas.json");
            this.vertexDataLoader.deserialize(await datas.json());
        }
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "fetch VertexDataLoader");
        
        let rect = this.canvas.getBoundingClientRect();
        this.screenRatio = rect.width / rect.height;
        if (this.screenRatio < 1) {
            document.body.classList.add("vertical");
            IsVertical = true;
        }
        else {
            document.body.classList.remove("vertical");
            IsVertical = false;
        }
        this.canvas.setAttribute("width", Math.floor(rect.width * this.performanceWatcher.devicePixelRatio).toFixed(0));
        this.canvas.setAttribute("height", Math.floor(rect.height * this.performanceWatcher.devicePixelRatio).toFixed(0));

        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(2, 4, 3)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.3, 0.3, 0.3);
        this.light.intensity = 0.7;

        this.spotlight = new BABYLON.SpotLight("spotlight", BABYLON.Vector3.Zero(), BABYLON.Vector3.Down(), Math.PI / 6, 10, this.scene);
        this.spotlight.intensity = 0;

        this.animLightIntensity = Mummu.AnimationFactory.CreateNumber(this.light, this.light, "intensity");
        this.animSpotlightIntensity = Mummu.AnimationFactory.CreateNumber(this.spotlight, this.spotlight, "intensity");

        let skyBoxHolder = new BABYLON.Mesh("skybox-holder");
        skyBoxHolder.rotation.x = 0;

        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1500 }, this.scene);
        this.skybox.parent = skyBoxHolder;
        let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture(
            "./datas/skyboxes/cloud",
            this.scene,
            ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        this.skybox.material = skyboxMaterial;

        this.camera = new PlayerCamera(this);
        //OutlinePostProcess.AddOutlinePostProcess(this.camera);

        if (window.localStorage.getItem("camera-position")) {
            let positionItem = JSON.parse(window.localStorage.getItem("camera-position"));
            let position = new BABYLON.Vector3(positionItem.x, positionItem.y, positionItem.z);
            if (Mummu.IsFinite(position)) {
                this.camera.position = position;
            }
        }
        if (window.localStorage.getItem("camera-rotation")) {
            let rotationItem = JSON.parse(window.localStorage.getItem("camera-rotation"));
            let rotation = new BABYLON.Vector3(rotationItem.x, rotationItem.y, rotationItem.z);
            if (Mummu.IsFinite(rotation)) {
                this.camera.rotation.x = rotation.x;
                this.camera.rotation.y = rotation.y;
                this.camera.rotation.z = rotation.z;
            }
        }
        
        this.router = new CarillonRouter(this);
        this.router.initialize();
        await this.router.postInitialize();
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "router initialized");

        this.uiInputManager.initialize();

        if (this.engine.webGLVersion === 2) {
            try {
                let cubicNoiseTexture = new CubicNoiseTexture(this.scene);
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.randomize();
                cubicNoiseTexture.smooth();
                this.noiseTexture = cubicNoiseTexture.get3DTexture();
                this.performanceWatcher.supportTexture3D = true;
            }
            catch (e) {
                console.error("[ERROR FALLBACKED] No support for 3DTexture, explosion effects are disabled.");
                this.performanceWatcher.supportTexture3D = false;
            }
        }
        else {
            this.performanceWatcher.supportTexture3D = false;
        }

        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "puzzles loaded");

        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        this.canvas.addEventListener("wheel", this.onWheelEvent);

        
        if (USE_CG_SDK) {
            console.log("Use CrazyGames SDK");
        }

        if (!(USE_POKI_SDK || USE_CG_SDK)) {

        }

        if (window.top!=window.self) {
            document.body.classList.add("in-iframe");
            if (window.location.search) {
                TOP_HOST = window.location.search.replace("?", "");
            }
            else {
                TOP_HOST = "UNKWN";
            }
        }
        else {
            TOP_HOST = "TIARATUM";
        }

        this.router.start();

        document.querySelectorAll(".fullscreen-btn").forEach(e => {
            if (e instanceof HTMLButtonElement) {
                e.onclick = () => {
                    document.body.requestFullscreen();
                }
            }
        });

        let ambient = this.soundManager.createSound(
            "ambient",
            "./datas/sounds/zen-ambient.mp3",
            this.scene,
            () => {
                ambient.setVolume(0.15)
            },
            {
                autoplay: true,
                loop: true
            }
        );

        this.defaultToonMaterial = new ToonMaterial("default-toon-material", this.scene);
        this.defaultToonMaterial.setUseVertexColor(true);
        this.defaultToonMaterial.setDiffuseSharpness(-1);
        this.defaultToonMaterial.setDiffuseCount(2);

        this.defaultHighlightMaterial = new BABYLON.StandardMaterial("default-highlight-material", this.scene);
        this.defaultHighlightMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.defaultHighlightMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.defaultHighlightMaterial.alpha = 0.2;

        this.networkManager = new NetworkManager(this);

        this.colorPicker = document.querySelector("color-picker");
        this.colorPicker.initColorButtons(this);

        this.brickMenuView = document.querySelector("brick-menu") as BrickMenuView;

        this.playerInventoryView = document.querySelector("inventory-page") as PlayerInventoryView;
        
        this.playerActionView = new PlayerActionView();
        this.homeMenuPlate = new HomeMenuPlate(this);

        this.terrain = new Terrain(this);
        this.terrainManager = new TerrainManager(this.terrain);

        this.npcManager = new NPCManager(this);
        this.npcManager.initialize();

        this.playerDodo = new Dodo("", GenerateRandomDodoName(), this, { speed: 3, stepDuration: 0.25 });
        this.playerDodo.brain = new Brain(this.playerDodo, BrainMode.Player);
        this.playerDodo.brain.initialize();
        this.playerBrain = this.playerDodo.brain;
        this.playerBrainPlayer = this.playerBrain.subBrains[BrainMode.Player] as BrainPlayer;

        let playerBrain = (this.playerDodo.brain.subBrains[BrainMode.Player] as BrainPlayer);
        this.playerInventoryView.setInventory(playerBrain.inventory);
        this.playerActionView.initialize(playerBrain);

        this.inputManager.initialize();

        this.networkDodos = [];
        this.npcDodos = [];

        for (let n = 0; n < 0; n++) {
            let npcDodo = new Dodo("", "Test", this, {
                speed: 1 + Math.random(),
                stepDuration: 0.2 + 0.1 * Math.random()
            });
            await npcDodo.instantiate();
            npcDodo.unfold();
            npcDodo.setWorldPosition(new BABYLON.Vector3(-5 + 10 * Math.random(), 1, -5 + 10 * Math.random()));
            npcDodo.brain = new Brain(npcDodo, BrainMode.Idle, BrainMode.Travel);
            npcDodo.brain.initialize();
            this.npcDodos.push(npcDodo);
        }

        this.camera.player = this.playerDodo;
        await this.playerDodo.instantiate();

        LoadPlayerFromLocalStorage(this);

        this.homeMenuPlate.initialize();

        document.querySelector("#start").addEventListener("click", () => {
            this.setGameMode(GameMode.Playing);
        })

        //let brick = new Brick(this.brickManager, Brick.BrickIdToIndex("brick_4x1"), 0);
        //brick.position.copyFromFloats(0, TILE_H, 0);
        //brick.updateMesh();

        this.gameLoaded = true;

        this.setGameMode(GameMode.Home);

        I18Nizer.Translate(LOCALE);
        if (USE_POKI_SDK) {
            PokiSDK.gameLoadingFinished();
        }
        document.body.addEventListener("touchstart", onFirstPlayerInteractionTouch);
        document.body.addEventListener("click", onFirstPlayerInteractionClick);
        document.body.addEventListener("keydown", onFirstPlayerInteractionKeyboard);
        
        if (location.host.startsWith("127.0.0.1")) {
            //document.getElementById("click-anywhere-screen").style.display = "none";
            //(document.querySelector("#dev-pass-input") as HTMLInputElement).value = "Crillion";
            //DEV_ACTIVATE();
        }
        if (USE_CG_SDK) {
            document.getElementById("click-anywhere-screen").style.display = "none";
        }
        //this.performanceWatcher.showDebug();
	}

    public async setGameMode(mode: GameMode) {
        this.gameMode = mode;
        if (this.gameMode === GameMode.Home) {
            this.inputManager.temporaryNoPointerLock = true;
            (document.querySelector("#ingame-ui") as HTMLDivElement).style.display = "none";
            (document.querySelector("#home-page") as HTMLDivElement).style.display = "block";
            this.playerDodo.unfold();
            this.playerDodo.setWorldPosition(new BABYLON.Vector3(0, -1000, 0));
            this.playerDodo.r = - 4 * Math.PI / 6;
        }
        else if (this.gameMode === GameMode.Playing) {
            this.inputManager.temporaryNoPointerLock = false;
            (document.querySelector("#ingame-ui") as HTMLDivElement).style.display = "block";
            (document.querySelector("#home-page") as HTMLDivElement).style.display = "none";
            if (LoadPlayerPositionFromLocalStorage(this)) {

            }
            else {
                this.playerDodo.setWorldPosition(new BABYLON.Vector3(this.terrain.chunckSize_m * 0.5, 10, this.terrain.chunckSize_m * 0.5));
                this.playerDodo.r = 0;
            }
            this.playerDodo.unfold();
            this.networkManager.initialize();

            let playerBrain = (this.playerDodo.brain.subBrains[BrainMode.Player] as BrainPlayer);

            let action = await PlayerActionTemplate.CreateBrickAction(playerBrain, "brick_4x1x1", 0);
            playerBrain.playerActionManager.linkAction(action, 1);

            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_1x1x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_2x1x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_4x1x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_6x1x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick-corner-curved_3x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("tile_4x4", InventoryCategory.Brick, this));
            
            this.npcManager.instantiate();

            for (let i = 0; i < DodoColors.length; i++) {
                playerBrain.inventory.addItem(new PlayerInventoryItem(DodoColors[i].name, InventoryCategory.Paint, this));
            }
        }
    }

    public onResize = () => {
        let rect = this.canvas.getBoundingClientRect();
        this.screenRatio = rect.width / rect.height;
        if (this.screenRatio < 1) {
            document.body.classList.add("vertical");
        }
        else {
            document.body.classList.remove("vertical");
        }
        this.engine.resize(true);
        this.canvas.setAttribute("width", Math.floor(rect.width * this.performanceWatcher.devicePixelRatio).toFixed(0));
        this.canvas.setAttribute("height", Math.floor(rect.height * this.performanceWatcher.devicePixelRatio).toFixed(0));
    }

	public animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
			this.update();
		});
        
		window.onresize = this.onResize;
        if (screen && screen.orientation) {
            screen.orientation.onchange = this.onResize;
        }
	}

    public async initialize(): Promise<void> {
        
    }

    public getCameraHorizontalFOV(): number {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.camera.fov / 2));
    }

    public movieIdleDir: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public factoredTimeSinceGameStart: number = 0;
    public averagedFPS: number = 0;
    public updateConfigTimeout: number = - 1;
    public globalTimer: number = 0;
    public savePlayerCooldown: number = 2;
    public update(): void {
        let rawDT = this.scene.deltaTime / 1000;
        this.performanceWatcher.update(rawDT);
        if (isFinite(rawDT)) {
            this.globalTimer += rawDT;
            this.terrainManager.update();
            this.playerDodo.update(rawDT);
            this.networkDodos.forEach(dodo => {
                dodo.update(rawDT);
            })
            this.npcDodos.forEach(dodo => {
                dodo.update(rawDT);
            })
            this.camera.onUpdate(rawDT);

            let camPos = this.camera.position.clone();
            let camRotation = this.camera.rotation.clone();
            if (HasLocalStorage) {
                window.localStorage.setItem("camera-position", JSON.stringify({ x: camPos.x, y: camPos.y, z: camPos.z }));
                window.localStorage.setItem("camera-rotation", JSON.stringify({ x: camRotation.x, y: camRotation.y, z: camRotation.z }));
            }
            this.savePlayerCooldown -= rawDT;
            if (this.savePlayerCooldown < 0) {
                SavePlayerPositionToLocalStorage(this);
                this.savePlayerCooldown = 3;
            }
        }
    }

    public canvasLeft: number = 0;

    private _pointerDownX: number = 0;
    private _pointerDownY: number = 0;
    public onPointerDown = (event: PointerEvent) => {
        this._pointerDownX = this.scene.pointerX;
        this._pointerDownY = this.scene.pointerY;
    }

    public onPointerUp = (event: PointerEvent) => {
        
    }

    public onWheelEvent = (event: WheelEvent) => {
        
    }

    public storyExpertTable: { story_id: number, expert_id: number }[] = [];
    public storyIdToExpertId(storyId: number): number {
        let element = this.storyExpertTable.find(e => { return e.story_id === storyId; });
        if (element) {
            return element.expert_id; 
        }
    }
    public expertIdToStoryId(expertId: number): number[] {
        let element = this.storyExpertTable.filter(e => { return e.expert_id === expertId; });
        if (element) {
            return element.map(e => { return e.story_id; }); 
        }
        return [];
    }

    private _curtainOpacity: number = 0;
    public get curtainOpacity(): number {
        return this._curtainOpacity;
    }
    public set curtainOpacity(v: number) {
        this._curtainOpacity = v;
        if (this._curtainOpacity === 0) {
            this.canvasCurtain.style.display = "none";
        }
        else {
            this.canvasCurtain.style.display = "block";
            this.canvasCurtain.style.backgroundColor = "#000000" + Math.round(this._curtainOpacity * 255).toString(16).padStart(2, "0");
        }
    }

    public fadeIntroDir: number = 0;

    public async fadeInIntro(duration: number = 1): Promise<void> {
        //await RandomWait();
        return new Promise<void>(resolve => {
            if (this.router.puzzleIntro) {
                this.router.puzzleIntro.style.opacity = "0";
                this.router.puzzleIntro.style.display = "";
        
                let t0 = performance.now();
                let step = () => {
                    if (this.fadeIntroDir < 0) {
                        return;
                    }
                    let f = (performance.now() - t0) / 1000 / duration;
                    if (f < 1) {
                        this.router.puzzleIntro.style.opacity = f.toFixed(2);
                        requestAnimationFrame(step);
                    }
                    else {
                        this.router.puzzleIntro.style.opacity = "1";
                        this.router.puzzleIntro.style.display = "";
                        resolve();
                    }
                }
                this.fadeIntroDir = 1;
                step();
            }
        });
    }

    public async fadeOutIntro(duration: number = 1): Promise<void> {
        //await RandomWait();
        if (this.router.puzzleIntro) {
            this.router.puzzleIntro.style.opacity = "1";
            this.router.puzzleIntro.style.display = "";
    
            let t0 = performance.now();
            let step = () => {
                if (this.fadeIntroDir > 0) {
                    return;
                }
                let f = (performance.now() - t0) / 1000 / duration;
                if (f < 1) {
                    this.router.puzzleIntro.style.opacity = (1 - f).toFixed(2);
                    requestAnimationFrame(step);
                }
                else {
                    this.router.puzzleIntro.style.opacity = "0";
                    this.router.puzzleIntro.style.display = "none";
                }
            }
            this.fadeIntroDir = -1;
            step();
        }
    }
}

function DEBUG_LOG_MESHES_NAMES(): void {
    let meshes = Game.Instance.scene.meshes.map(m => { return m.name; });
    let countedMeshNames: Array<{ name: string, count: number }> = [];
    meshes.forEach(meshName => {
        let existing = countedMeshNames.find(e => { return e.name === meshName; });
        if (!existing) {
            countedMeshNames.push({name: meshName, count: 1});
        }
        else {
            existing.count++;
        }
    });
    countedMeshNames.sort((e1, e2) => { return e1.count - e2.count; });
    console.log(countedMeshNames);
}

async function RandomWait(): Promise<void> {
    return new Promise<void>(resolve => {
        if (Math.random() < 0.9) {
            resolve();
        }
        else {
            setTimeout(() => {
                resolve()
            }, Math.random() * 500);
        }
    });
}

let createAndInit = async () => {
    try {
        window.localStorage.setItem("test-local-storage", "Test Local Storage Availability");
        window.localStorage.removeItem("test-local-storage");
        HasLocalStorage = true;        
    }
    catch {
        HasLocalStorage = false;
    }
    let main: Game = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
}

requestAnimationFrame(async () => {
    if (USE_POKI_SDK) {
        PokiSDK.init().then(() => {
            createAndInit();
        })
    }
    else if (USE_CG_SDK) {
        CrazySDK = (window as any).CrazyGames.SDK;
        await CrazySDK.init();
        createAndInit();
    }
    else {
        createAndInit();
    }
});