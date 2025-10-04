class Analytics {
    constructor(game) {
        this.game = game;
    }
    async sendEvent(eventType) {
        let body = {
            puzzle_id: 0,
            event_type: eventType,
            top_host: TOP_HOST
        };
        const response = await fetch(SHARE_SERVICE_PATH + "analytics", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        console.log(await response.text());
    }
}
class CarillonRouter extends Nabu.Router {
    constructor(game) {
        super();
        this.game = game;
    }
    async postInitialize() {
        //await RandomWait();
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        this.creditsPage = document.querySelector("#credits-page");
        this.playUI = document.querySelector("#play-ui");
        this.editorUI = document.querySelector("#editor-ui");
        this.devPage = document.querySelector("#dev-page");
        this.eulaPage = document.querySelector("#eula-page");
        this.playBackButton = document.querySelector("#play-ui .back-btn");
        this.timerText = document.querySelector("#play-timer");
        this.puzzleIntro = document.querySelector("#puzzle-intro");
    }
    onUpdate() { }
    async onHRefChange(page, previousPage) {
        //await RandomWait();
        console.log("onHRefChange from " + previousPage + " to " + page);
        //?gdmachineId=1979464530
        let showTime = 0.5;
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        this.game.globalTimer = 0;
        if (page.startsWith("#options")) {
            SDKGameplayStop();
        }
        else if (page.startsWith("#credits")) {
            SDKGameplayStop();
            await this.show(this.creditsPage, false, showTime);
        }
        else if (page === "#dev") {
            SDKGameplayStop();
            await this.show(this.devPage, false, showTime);
        }
        else {
            location.hash = "#home";
            return;
        }
    }
}
class CompletionBar extends HTMLElement {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.showText = true;
    }
    static get observedAttributes() {
        return ["value", "show-text"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "value") {
            this.setValue(parseFloat(newValue));
        }
        if (name === "show-text") {
            this.showText = newValue === "true" ? true : false;
            this.setValue(this.value);
        }
    }
    connectedCallback() {
        this.completedBar = document.createElement("div");
        this.completedBar.classList.add("completed");
        this.completedBar.style.position = "absolute";
        this.completedBar.style.top = "-1px";
        this.completedBar.style.left = "-1px";
        this.completedBar.style.height = "inherit";
        this.completedBar.style.border = "inherit";
        this.completedBar.style.borderRadius = "inherit";
        this.appendChild(this.completedBar);
        this.valueText = document.createElement("span");
        this.valueText.classList.add("completed-text");
        this.valueText.style.position = "relative";
        this.valueText.style.display = "none";
        this.valueText.style.marginRight = "5px";
        this.valueText.style.marginLeft = "5px";
        this.valueText.style.display = "inline-block";
        this.valueText.style.color = "white";
        this.valueText.style.fontWeight = "500";
        this.appendChild(this.valueText);
        if (this.hasAttribute("value")) {
            this.setValue(parseFloat(this.getAttribute("value")));
        }
    }
    animateValueTo(v, duration = 1) {
        let t0 = performance.now();
        let vOrigin = this.value;
        let vDestination = v;
        let step = () => {
            let t = (performance.now() - t0) / 1000;
            let f = t / duration;
            if (f < 1) {
                let val = vOrigin * (1 - f) + vDestination * f;
                let currPercent = Math.floor(this.value * 100);
                let valPercent = Math.floor(val * 100);
                if (currPercent != valPercent) {
                    this.setValue(val);
                }
                requestAnimationFrame(step);
            }
            else {
                this.classList.remove("animating");
                this.setValue(vDestination);
            }
        };
        this.classList.add("animating");
        step();
    }
    setValue(v) {
        if (this.completedBar && this.valueText) {
            this.value = v;
            let percent = Math.floor(v * 100);
            let percentString = percent.toFixed(0) + "%";
            if (percent === 0) {
                this.completedBar.style.display = "none";
            }
            else {
                let invPercentString = (100 - percent).toFixed(0) + "%";
                this.completedBar.style.display = "block";
                this.completedBar.style.width = percentString;
                this.completedBar.style.backgroundColor = "color-mix(in srgb, #e0c872 " + percentString + ", #624c3c " + invPercentString + ")";
            }
            this.valueText.innerHTML = percentString + " completed";
            if (percent > 50) {
                this.completedBar.appendChild(this.valueText);
                this.style.textAlign = "left";
                this.valueText.style.display = this.showText ? "block" : "none";
                this.valueText.style.color = "black";
                this.valueText.style.fontWeight = "900";
            }
            else {
                this.appendChild(this.valueText);
                this.style.textAlign = "right";
                this.valueText.style.display = this.showText ? "block" : "none";
                this.valueText.style.color = "white";
                this.valueText.style.fontWeight = "500";
            }
            if (percent > 70) {
                this.valueText.style.color = "black";
                this.valueText.style.fontWeight = "900";
            }
            else {
                this.valueText.style.color = "white";
                this.valueText.style.fontWeight = "500";
            }
        }
    }
}
customElements.define("completion-bar", CompletionBar);
/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>
//mklink /D C:\Users\tgames\OneDrive\Documents\GitHub\fluid-x\lib\nabu\ C:\Users\tgames\OneDrive\Documents\GitHub\nabu
var MAJOR_VERSION = 0;
var MINOR_VERSION = 0;
var PATCH_VERSION = 1;
var VERSION = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var CONFIGURATION_VERSION = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var observed_progress_speed_percent_second;
var setProgressIndex;
var GLOBAL_GAME_LOAD_CURRENT_STEP;
var USE_POKI_SDK;
var USE_CG_SDK;
var OFFLINE_MODE;
var NO_VERTEX_DATA_LOADER;
var ADVENT_CAL;
var PokiSDK;
var CrazySDK;
var LOCALE = "en";
var TOP_HOST;
var SDKPlaying = false;
function SDKGameplayStart() {
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
var CanStartCommercialBreak = false;
async function PokiCommercialBreak() {
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
function SDKGameplayStop() {
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
var IsMobile = -1;
var HasLocalStorage = false;
function StorageGetItem(key) {
    if (USE_CG_SDK) {
        return CrazySDK.data.getItem(key);
    }
    else {
        return localStorage.getItem(key);
    }
}
function StorageSetItem(key, value) {
    if (USE_CG_SDK) {
        CrazySDK.data.setItem(key, value);
    }
    else {
        localStorage.setItem(key, value);
    }
}
var SHARE_SERVICE_PATH = "https://dodo.tiaratum.com/index.php/";
if (location.host.startsWith("127.0.0.1")) {
    SHARE_SERVICE_PATH = "http://localhost/index.php/";
}
async function WaitPlayerInteraction() {
    return new Promise(resolve => {
        let wait = () => {
            if (PlayerHasInteracted) {
                resolve();
            }
            else {
                requestAnimationFrame(wait);
            }
        };
        wait();
    });
}
function firstPlayerInteraction() {
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
let onFirstPlayerInteractionTouch = (ev) => {
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
};
let onFirstPlayerInteractionClick = (ev) => {
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
};
let onFirstPlayerInteractionKeyboard = (ev) => {
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
};
function addLine(text) {
    let e = document.createElement("div");
    e.classList.add("debug-log");
    e.innerText = text;
    document.body.appendChild(e);
}
function StopPointerProgatation(ev) {
    ev.stopPropagation();
}
function StopPointerProgatationAndMonkeys(ev) {
    console.log("StopPointerProgatationAndMonkeys");
    ev.stopPropagation();
}
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = true;
        this.DEBUG_USE_LOCAL_STORAGE = true;
        this.screenRatio = 1;
        this.animLightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animSpotlightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
        this.gameLoaded = false;
        this.onResize = () => {
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
        };
        this.movieIdleDir = BABYLON.Vector3.Zero();
        this.factoredTimeSinceGameStart = 0;
        this.averagedFPS = 0;
        this.updateConfigTimeout = -1;
        this.globalTimer = 0;
        this.canvasLeft = 0;
        this._pointerDownX = 0;
        this._pointerDownY = 0;
        this.onPointerDown = (event) => {
            this._pointerDownX = this.scene.pointerX;
            this._pointerDownY = this.scene.pointerY;
        };
        this.onPointerUp = (event) => {
        };
        this.onWheelEvent = (event) => {
        };
        this.storyExpertTable = [];
        this._curtainOpacity = 0;
        this.fadeIntroDir = 0;
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.canvasCurtain = document.getElementById("canvas-curtain");
        this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        BABYLON.Engine.audioEngine.lock();
        this.soundManager = new SoundManager();
        this.uiInputManager = new UserInterfaceInputManager(this);
        this.performanceWatcher = new PerformanceWatcher(this);
        this.analytics = new Analytics(this);
    }
    getScene() {
        return this.scene;
    }
    async createScene() {
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
        }
        else {
            document.body.classList.remove("vertical");
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
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture("./datas/skyboxes/cloud", this.scene, ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        this.skybox.material = skyboxMaterial;
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 128, 0));
        this.camera.attachControl();
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
        if (window.top != window.self) {
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
                };
            }
        });
        let ambient = this.soundManager.createSound("ambient", "./datas/sounds/zen-ambient.mp3", this.scene, () => {
            ambient.setVolume(0.15);
        }, {
            autoplay: true,
            loop: true
        });
        this.defaultToonMaterial = new BABYLON.StandardMaterial("default-toon-material");
        this.defaultToonMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.terrain = new Terrain(this);
        this.terrainManager = new TerrainManager(this.terrain);
        this.playerDodo = new Dodo("Sven", this);
        await this.playerDodo.instantiate();
        this.playerDodo.setWorldPosition(new BABYLON.Vector3(-3.866651255957095, 6.411329332679692, 52.84466100342614));
        this.gameLoaded = true;
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
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.update();
        });
        window.onresize = this.onResize;
        if (screen && screen.orientation) {
            screen.orientation.onchange = this.onResize;
        }
    }
    async initialize() {
    }
    getCameraHorizontalFOV() {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.camera.fov / 2));
    }
    update() {
        let rawDT = this.scene.deltaTime / 1000;
        this.performanceWatcher.update(rawDT);
        if (isFinite(rawDT)) {
            this.globalTimer += rawDT;
            this.terrainManager.update();
            this.playerDodo.update(rawDT);
            let camPos = this.camera.position.clone();
            let camRotation = this.camera.rotation.clone();
            if (HasLocalStorage) {
                window.localStorage.setItem("camera-position", JSON.stringify({ x: camPos.x, y: camPos.y, z: camPos.z }));
                window.localStorage.setItem("camera-rotation", JSON.stringify({ x: camRotation.x, y: camRotation.y, z: camRotation.z }));
            }
        }
    }
    storyIdToExpertId(storyId) {
        let element = this.storyExpertTable.find(e => { return e.story_id === storyId; });
        if (element) {
            return element.expert_id;
        }
    }
    expertIdToStoryId(expertId) {
        let element = this.storyExpertTable.filter(e => { return e.expert_id === expertId; });
        if (element) {
            return element.map(e => { return e.story_id; });
        }
        return [];
    }
    get curtainOpacity() {
        return this._curtainOpacity;
    }
    set curtainOpacity(v) {
        this._curtainOpacity = v;
        if (this._curtainOpacity === 0) {
            this.canvasCurtain.style.display = "none";
        }
        else {
            this.canvasCurtain.style.display = "block";
            this.canvasCurtain.style.backgroundColor = "#000000" + Math.round(this._curtainOpacity * 255).toString(16).padStart(2, "0");
        }
    }
    async fadeInIntro(duration = 1) {
        //await RandomWait();
        return new Promise(resolve => {
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
                };
                this.fadeIntroDir = 1;
                step();
            }
        });
    }
    async fadeOutIntro(duration = 1) {
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
            };
            this.fadeIntroDir = -1;
            step();
        }
    }
}
function DEBUG_LOG_MESHES_NAMES() {
    let meshes = Game.Instance.scene.meshes.map(m => { return m.name; });
    let countedMeshNames = [];
    meshes.forEach(meshName => {
        let existing = countedMeshNames.find(e => { return e.name === meshName; });
        if (!existing) {
            countedMeshNames.push({ name: meshName, count: 1 });
        }
        else {
            existing.count++;
        }
    });
    countedMeshNames.sort((e1, e2) => { return e1.count - e2.count; });
    console.log(countedMeshNames);
}
async function RandomWait() {
    return new Promise(resolve => {
        if (Math.random() < 0.9) {
            resolve();
        }
        else {
            setTimeout(() => {
                resolve();
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
    let main = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
};
requestAnimationFrame(async () => {
    if (USE_POKI_SDK) {
        PokiSDK.init().then(() => {
            createAndInit();
        });
    }
    else if (USE_CG_SDK) {
        CrazySDK = window.CrazyGames.SDK;
        await CrazySDK.init();
        createAndInit();
    }
    else {
        createAndInit();
    }
});
class NumValueInput extends HTMLElement {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.valueToString = (v) => {
            return v.toFixed(0);
        };
    }
    static get observedAttributes() {
        return ["value-width", "min", "max", "wrap"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "value-width") {
            if (this.valueDisplay) {
                this.valueDisplay.style.width = newValue;
            }
        }
        if (name === "wrap") {
            if (newValue === "true") {
                this.wrap = true;
            }
            else {
                this.wrap = false;
            }
        }
        if (name === "min") {
            this.min = parseInt(newValue);
        }
        if (name === "max") {
            this.max = parseInt(newValue);
        }
    }
    connectedCallback() {
        this.buttonMinus = document.createElement("button");
        this.buttonMinus.classList.add("xsmall-btn", "green");
        this.buttonMinus.innerHTML = "<stroke-text>-</stroke-text>";
        this.appendChild(this.buttonMinus);
        this.buttonMinus.onpointerup = () => {
            this.setValue(this.value - 1);
            if (this.onValueChange) {
                this.onValueChange(this.value);
            }
        };
        this.valueDisplay = document.createElement("span");
        this.valueDisplay.style.display = "inline-block";
        if (this.hasAttribute("value-width")) {
            this.valueDisplay.style.width = this.getAttribute("value-width");
        }
        else {
            this.valueDisplay.style.width = "50px";
        }
        this.valueDisplay.style.fontSize = "20px";
        this.valueDisplay.style.fontWeight = "900";
        this.valueDisplay.style.textAlign = "center";
        this.valueDisplayText = document.createElement("stroke-text");
        this.valueDisplay.appendChild(this.valueDisplayText);
        this.appendChild(this.valueDisplay);
        this.buttonPlus = document.createElement("button");
        this.buttonPlus.classList.add("xsmall-btn", "green");
        this.buttonPlus.innerHTML = "<stroke-text>+</stroke-text>";
        this.appendChild(this.buttonPlus);
        this.buttonPlus.onpointerup = () => {
            this.setValue(this.value + 1);
            if (this.onValueChange) {
                this.onValueChange(this.value);
            }
        };
    }
    _updateValueDisplay() {
        this.valueDisplayText.setContent(this.valueToString(this.value));
    }
    setValue(v) {
        this.value = v;
        if (this.wrap && isFinite(this.min) && isFinite(this.max)) {
            if (this.value < this.min) {
                this.value = this.max;
            }
            if (this.value > this.max) {
                this.value = this.min;
            }
        }
        else if (isFinite(this.min)) {
            this.value = Math.max(this.value, this.min);
        }
        else if (isFinite(this.max)) {
            this.value = Math.min(this.value, this.max);
        }
        this._updateValueDisplay();
    }
}
customElements.define("num-value-input", NumValueInput);
class PerformanceWatcher {
    constructor(game) {
        this.game = game;
        this.supportTexture3D = false;
        this.average = 24;
        this.worst = 24;
        this.isWorstTooLow = false;
        this.devicePixelRationess = 5;
        this.targetDevicePixelRationess = this.devicePixelRationess;
        this.devicePixelRatioSteps = 10;
        this.resizeCD = 0;
    }
    get devicePixelRatio() {
        let f = this.devicePixelRationess / this.devicePixelRatioSteps;
        return window.devicePixelRatio * f + 0.5 * (1 - f);
    }
    setDevicePixelRationess(v) {
        if (isFinite(v)) {
            v = Nabu.MinMax(v, 0, this.devicePixelRatioSteps);
            if (this.devicePixelRationess != v) {
                this.devicePixelRationess = v;
                let rect = this.game.canvas.getBoundingClientRect();
                requestAnimationFrame(() => {
                    let w = Math.floor(rect.width * this.devicePixelRatio).toFixed(0);
                    let h = Math.floor(rect.height * this.devicePixelRatio).toFixed(0);
                    this.game.canvas.setAttribute("width", w);
                    this.game.canvas.setAttribute("height", h);
                    console.log("update canvas resolution to " + w + " " + h);
                });
                this.resizeCD = 1;
            }
        }
    }
    update(rawDt) {
        let fps = 1 / rawDt;
        if (isFinite(fps)) {
            this.average = 0.95 * this.average + 0.05 * fps;
            let devicePixelRationess = Math.round((this.average - 24) / (60 - 24) * this.devicePixelRatioSteps);
            devicePixelRationess = Nabu.MinMax(devicePixelRationess, this.devicePixelRationess - 1, this.devicePixelRationess + 1);
            if (devicePixelRationess != this.targetDevicePixelRationess) {
                this.resizeCD = 1;
                this.targetDevicePixelRationess = devicePixelRationess;
            }
            this.resizeCD = Math.max(0, this.resizeCD - rawDt);
            if (this.resizeCD <= 0 && this.targetDevicePixelRationess != this.devicePixelRationess) {
                this.setDevicePixelRationess(this.targetDevicePixelRationess);
            }
            this.worst = Math.min(fps, this.worst);
            this.worst = 0.995 * this.worst + 0.005 * this.average;
            if (this.worst < 24) {
                this.isWorstTooLow = true;
            }
            else if (this.worst > 26) {
                this.isWorstTooLow = false;
            }
        }
    }
    showDebug() {
        let s = 0.3;
        if (document.body.classList.contains("vertical")) {
            s = 0.2;
        }
        let quad = BABYLON.CreateGround("quad", { width: s, height: s * 1.5 });
        quad.parent = this.game.camera;
        let hFov = this.game.getCameraHorizontalFOV();
        let a = hFov / 2;
        quad.position.z = 3;
        quad.position.x = -Math.tan(a) * quad.position.z + s * 0.5;
        quad.position.y = 2 * s;
        quad.rotation.x = -0.5 * Math.PI;
        let debugMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        let dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 150, height: 225 });
        dynamicTexture.hasAlpha = true;
        debugMaterial.diffuseTexture = dynamicTexture;
        debugMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        debugMaterial.specularColor.copyFromFloats(0, 0, 0);
        debugMaterial.useAlphaFromDiffuseTexture = true;
        quad.material = debugMaterial;
        let update = () => {
            let context = dynamicTexture.getContext();
            context.clearRect(0, 0, 150, 225);
            context.fillStyle = "#00000080";
            context.fillRect(0, 0, 150, 225);
            context.fillStyle = "white";
            context.font = "35px monospace";
            let lineHeight = 40;
            context.fillText(this.average.toFixed(0) + " fa", 15, lineHeight);
            context.fillText(this.worst.toFixed(0) + " fm", 15, 2 * lineHeight);
            let meshesCount = this.game.scene.meshes.length;
            context.fillText(meshesCount.toFixed(0) + " me", 15, 3 * lineHeight);
            let materialsCount = this.game.scene.materials.length;
            context.fillText(materialsCount.toFixed(0) + " ma", 15, 4 * lineHeight);
            let trianglesCount = 0;
            this.game.scene.meshes.forEach(mesh => {
                let indices = mesh.getIndices();
                trianglesCount += indices.length / 3;
            });
            //context.fillText(Math.floor(trianglesCount / 1000).toFixed(0) + " kt", 15, 5 * lineHeight);
            context.fillText(this.devicePixelRatio.toFixed(4), 15, 5 * lineHeight);
            dynamicTexture.update();
        };
        setInterval(update, 100);
    }
}
class MySound {
    constructor(soundManager, _name, _urlOrArrayBuffer, _scene, _readyToPlayCallback, _options, instancesCount = 1) {
        this.soundManager = soundManager;
        this._name = _name;
        this._urlOrArrayBuffer = _urlOrArrayBuffer;
        this._scene = _scene;
        this._readyToPlayCallback = _readyToPlayCallback;
        this._options = _options;
        this.instancesCount = instancesCount;
        this._loaded = false;
        this._sounds = [];
    }
    get duration() {
        if (this._sounds[0]) {
            return this._sounds[0].getAudioBuffer().duration;
        }
        return 0;
    }
    load() {
        if (this._loaded) {
            return;
        }
        this._sounds[0] = new BABYLON.Sound(this._name, this._urlOrArrayBuffer, this._scene, this._readyToPlayCallback, this._options);
        for (let i = 1; i < this.instancesCount; i++) {
            this._sounds[i] = this._sounds[0].clone();
        }
        this._loaded = true;
    }
    play(time, offset, length) {
        if (this._loaded) {
            for (let i = 0; i < this.instancesCount; i++) {
                if (!this._sounds[i].isPlaying) {
                    this._sounds[i].play(time, offset, length);
                    return;
                }
            }
        }
    }
    setVolume(newVolume, time) {
        if (this._loaded) {
            for (let i = 0; i < this.instancesCount; i++) {
                this._sounds[i].setVolume(newVolume, time);
            }
        }
    }
}
class SoundManager {
    constructor() {
        this.managedSounds = [];
    }
    createSound(name, urlOrArrayBuffer, scene, readyToPlayCallback, options, instancesCount = 1) {
        let mySound = new MySound(this, name, urlOrArrayBuffer, scene, readyToPlayCallback, options, instancesCount);
        if (BABYLON.Engine.audioEngine.unlocked) {
            mySound.load();
        }
        this.managedSounds.push(mySound);
        return mySound;
    }
    isSoundOn() {
        if (BABYLON.Engine.audioEngine.unlocked && BABYLON.Engine.audioEngine.getGlobalVolume() > 0) {
            return true;
        }
        return false;
    }
    soundOn() {
        BABYLON.Engine.audioEngine.unlock();
        BABYLON.Engine.audioEngine.setGlobalVolume(1);
        for (let i = 0; i < this.managedSounds.length; i++) {
            this.managedSounds[i].load();
        }
        //(document.querySelector("#sound-btn") as HTMLButtonElement).classList.remove("mute");
    }
    soundOff() {
        BABYLON.Engine.audioEngine.setGlobalVolume(0);
        //(document.querySelector("#sound-btn") as HTMLButtonElement).classList.add("mute");
    }
}
class StrokeText extends HTMLElement {
    connectedCallback() {
        this.style.position = "relative";
        let o = (1 / window.devicePixelRatio).toFixed(1) + "px";
        o = "1px";
        this.style.textShadow = "1px 1px 0px #e3cfb4ff, -1px 1px 0px #e3cfb4ff, -1px -1px 0px #e3cfb4ff, 1px -1px 0px #e3cfb4ff";
    }
    setContent(text) {
        this.innerText = text;
    }
}
customElements.define("stroke-text", StrokeText);
class Chunck extends BABYLON.Mesh {
    constructor(i, j, terrain) {
        super("chunck_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.i = i;
        this.j = j;
        this.terrain = terrain;
    }
}
class Terrain {
    constructor(game) {
        this.game = game;
        this.worldZero = 100;
        this.chunckL = 64;
        this.mapL = 512;
        this.chuncks = new Nabu.UniqueList();
        let masterSeed = Nabu.MasterSeed.GetFor("Paulita6");
        let seededMap = Nabu.SeededMap.CreateFromMasterSeed(masterSeed, 4, 512);
        this.mapL = 1024;
        this.generator = new Nabu.TerrainMapGenerator(seededMap, [2048, 512, 128, 64]);
        this.material = new TerrainMaterial("terrain", this.game.scene);
        this.waterMaterial = new BABYLON.StandardMaterial("water-material");
        this.waterMaterial.specularColor.copyFromFloats(0.4, 0.4, 0.4);
        this.waterMaterial.alpha = 0.5;
        this.waterMaterial.diffuseColor.copyFromFloats(0.1, 0.3, 0.9);
    }
    tmpMapGet(i, j) {
        let iM = 1;
        let jM = 1;
        if (i < 0) {
            i += 1024;
            iM--;
        }
        if (j < 0) {
            j += 1024;
            jM--;
        }
        if (i >= 1024) {
            i -= 1024;
            iM++;
        }
        if (j >= 1024) {
            j -= 1024;
            jM++;
        }
        return this._tmpMaps[iM][jM].get(i, j);
    }
    async generateChunck(iChunck, jChunck) {
        let IMap = this.worldZero + Math.floor(iChunck * this.chunckL / this.mapL);
        let JMap = this.worldZero + Math.floor(jChunck * this.chunckL / this.mapL);
        this._tmpMaps = [];
        this._tmpMaps = [];
        for (let i = 0; i < 3; i++) {
            this._tmpMaps[i] = [];
            for (let j = 0; j < 3; j++) {
                this._tmpMaps[i][j] = await this.generator.getMap(IMap + i - 1, JMap + j - 1);
            }
        }
        let chunck = new Chunck(iChunck, jChunck, this);
        chunck.position.copyFromFloats(iChunck * this.chunckL, 0, jChunck * this.chunckL);
        chunck.material = this.material;
        let water = new BABYLON.Mesh("water");
        BABYLON.CreateGroundVertexData({ size: this.chunckL }).applyToMesh(water);
        water.position.copyFromFloats(this.chunckL * 0.5, -0.5 / 3, this.chunckL * 0.5);
        water.material = this.waterMaterial;
        water.parent = chunck;
        let l = this.chunckL;
        let lInc = l + 1;
        let vertexData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let iOffset = (iChunck * this.chunckL) % this.mapL;
        if (iOffset < 0) {
            iOffset = this.mapL + iOffset;
        }
        let jOffset = (jChunck * this.chunckL) % this.mapL;
        if (jOffset < 0) {
            jOffset = this.mapL + jOffset;
        }
        console.log("offset " + iOffset + " " + jOffset);
        for (let j = 0; j <= l; j++) {
            for (let i = 0; i <= l; i++) {
                let h = this.tmpMapGet(iOffset + i, jOffset + j) - 128;
                positions.push(i, h / 3, j);
            }
        }
        let pt0 = BABYLON.Vector3.Zero();
        let pt1 = BABYLON.Vector3.Zero();
        let pt2 = BABYLON.Vector3.Zero();
        let pt3 = BABYLON.Vector3.Zero();
        for (let j = 0; j <= l; j++) {
            for (let i = 0; i <= l; i++) {
                let h = this.tmpMapGet(iOffset + i, jOffset + j) - 128;
                let hIP = this.tmpMapGet(iOffset + i + 1, jOffset + j) - 128;
                let hIM = this.tmpMapGet(iOffset + i - 1, jOffset + j) - 128;
                let hJP = this.tmpMapGet(iOffset + i, jOffset + j + 1) - 128;
                let hJM = this.tmpMapGet(iOffset + i, jOffset + j - 1) - 128;
                pt0.copyFromFloats(1, hIP - h, 0);
                pt1.copyFromFloats(0, hJP - h, 1);
                pt2.copyFromFloats(-1, hIM - h, 0);
                pt3.copyFromFloats(0, hJM - h, -1);
                let c1 = BABYLON.Vector3.Cross(pt1, pt0);
                let c2 = BABYLON.Vector3.Cross(pt3, pt2);
                let n = c1.add(c2).normalize();
                normals.push(n.x, n.y, n.z);
            }
        }
        for (let j = 0; j < l; j++) {
            for (let i = 0; i < l; i++) {
                let p = i + j * (l + 1);
                pt0.copyFromFloats(positions[3 * p], positions[3 * p + 1], positions[3 * p + 2]);
                pt1.copyFromFloats(positions[3 * (p + 1)], positions[3 * (p + 1) + 1], positions[3 * (p + 1) + 2]);
                pt2.copyFromFloats(positions[3 * (p + lInc + 1)], positions[3 * (p + lInc + 1) + 1], positions[3 * (p + lInc + 1) + 2]);
                pt3.copyFromFloats(positions[3 * (p + lInc)], positions[3 * (p + lInc) + 1], positions[3 * (p + lInc) + 2]);
                if (BABYLON.Vector3.DistanceSquared(pt0, pt2) > BABYLON.Vector3.DistanceSquared(pt1, pt3)) {
                    indices.push(p, p + 1, p + lInc);
                    indices.push(p + 1, p + 1 + lInc, p + lInc);
                }
                else {
                    indices.push(p, p + 1, p + 1 + lInc);
                    indices.push(p, p + 1 + lInc, p + lInc);
                }
            }
        }
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.applyToMesh(chunck);
        return chunck;
    }
}
class TerrainManager {
    constructor(terrain) {
        this.terrain = terrain;
        this.range = 5;
        this.createTasks = [];
        this.disposeTasks = [];
        this._lastRefreshPosition = new BABYLON.Vector3(Infinity, 0, Infinity);
        this._lock = false;
    }
    get game() {
        return this.terrain.game;
    }
    addCreateTask(i, j) {
        let disposeTaskIndex = this.disposeTasks.findIndex(t => { return t.i === i && t.j === j; });
        if (disposeTaskIndex >= 0) {
            this.disposeTasks.splice(disposeTaskIndex, 1);
        }
        if (!this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j; })) {
            if (!this.createTasks.find(t => { return t.i === i && t.j === j; })) {
                this.createTasks.push({ i: i, j: j });
            }
        }
    }
    addDisposeTask(i, j) {
        let createTaskIndex = this.createTasks.findIndex(t => { return t.i === i && t.j === j; });
        if (createTaskIndex >= 0) {
            this.createTasks.splice(createTaskIndex, 1);
        }
        if (this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j; })) {
            if (!this.disposeTasks.find(t => { return t.i === i && t.j === j; })) {
                this.disposeTasks.push({ i: i, j: j });
            }
        }
    }
    refreshTaskList() {
        let position = this.game.camera.globalPosition.clone();
        position.y = 0;
        let iCenter = Math.floor(position.x / this.terrain.chunckL);
        let jCenter = Math.floor(position.z / this.terrain.chunckL);
        for (let i = iCenter - 4; i <= iCenter + 4; i++) {
            for (let j = jCenter - 4; j <= jCenter + 4; j++) {
                let cx = (i + 0.5) * this.terrain.chunckL;
                let cz = (j + 0.5) * this.terrain.chunckL;
                let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
                if (d < this.range * this.terrain.chunckL) {
                    this.addCreateTask(i, j);
                }
            }
        }
        this.terrain.chuncks.forEach(chunck => {
            let cx = (chunck.i + 0.5) * this.terrain.chunckL;
            let cz = (chunck.j + 0.5) * this.terrain.chunckL;
            let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
            if (d > (this.range + 1) * this.terrain.chunckL) {
                this.addDisposeTask(chunck.i, chunck.j);
            }
        });
        this._lastRefreshPosition = position;
    }
    async update() {
        if (this._lock) {
            return;
        }
        this._lock = true;
        let position = this.game.camera.globalPosition;
        if (Math.abs(position.x - this._lastRefreshPosition.x) > this.terrain.chunckL * 0.25 || Math.abs(position.z - this._lastRefreshPosition.z) > this.terrain.chunckL * 0.25) {
            this.refreshTaskList();
        }
        if (this.createTasks.length > 0) {
            let task = this.createTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j; });
            if (!chunck) {
                chunck = await this.terrain.generateChunck(task.i, task.j);
                this.terrain.chuncks.push(chunck);
            }
        }
        else if (this.disposeTasks.length > 0) {
            let task = this.disposeTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j; });
            if (chunck) {
                this.terrain.chuncks.remove(chunck);
                chunck.dispose();
            }
        }
        this._lock = false;
    }
}
class TerrainMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "terrainToon",
            fragment: "terrainToon",
        }, {
            attributes: ["position", "normal", "uv", "uv2", "color"],
            uniforms: [
                "world", "worldView", "worldViewProjection", "view", "projection",
                "lightInvDirW"
            ]
        });
        this._lightInvDirW = BABYLON.Vector3.Up();
        this.setLightInvDir(BABYLON.Vector3.One().normalize());
        this.setColor3("grassColor", BABYLON.Color3.FromHexString("#7c8d4c"));
        this.setColor3("dirtColor", BABYLON.Color3.FromHexString("#725428"));
        this.setColor3("sandColor", BABYLON.Color3.FromHexString("#f0f0b5"));
    }
    getLightInvDir() {
        return this._lightInvDirW;
    }
    setLightInvDir(p) {
        this._lightInvDirW.copyFrom(p);
        this.setVector3("lightInvDirW", this._lightInvDirW);
    }
}
/*
enum ToonSoundType {
    Poc,
    Rumble
}

interface IToonSoundProp {
    text?: string,
    texts?: string[],
    pos: BABYLON.Vector3,
    color: string,
    size: number,
    duration: number,
    type: ToonSoundType
}

class ToonSound extends BABYLON.Mesh {

    public dynamicTexture: BABYLON.DynamicTexture;
    public animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;

    private _timer: number = 0;
    public get active(): boolean {
        return this.isVisible;
    }
    public soundProp: IToonSoundProp;
    public get scale(): number {
        return this.scaling.x;
    }
    public set scale(v: number) {
        this.scaling.copyFromFloats(v, v, v);
    }

    constructor(
        public game: Game
    ) {
        super("haiku");
        BABYLON.CreateGroundVertexData({ width: 5, height: 1 }).applyToMesh(this);
        this.renderingGroupId = 1;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.isVisible = false;

        let haikuMaterial = new BABYLON.StandardMaterial("toon-sound-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("toon-sound-texture", { width: 200, height: 40 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;

        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public start(soundProps: IToonSoundProp): void {
        this.soundProp = soundProps;

        if (this.soundProp.text) {
            this.writeText(this.soundProp.text);
        }
        else if (this.soundProp.texts) {
            this.writeText(this.soundProp.texts[0]);
            this._lastDrawnTextIndex = 0;
        }

        this.position.copyFrom(this.soundProp.pos);
        this.rotDir = ((this.soundProp.pos.x - this.game.camera.target.x) > 0) ? 1 : - 1;

        this._timer = 0;
        this.scale = 0;
        this.isVisible = true;
    }

    public writeText(text: string): void {
        let context = this.dynamicTexture.getContext();
        context.clearRect(0, 0, 200, 40);

        context.font = "40px Julee";
        let l = context.measureText(text).width;

        let color = BABYLON.Color3.FromHexString(this.soundProp.color);
        let avg = (color.r + color.g + color.b) / 3;
        if (avg > 0.5) {
            context.fillStyle = "black";
        }
        else {
            context.fillStyle = "white";
        }
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                context.fillText(text, 100 - l * 0.5 + x, 34 + y);
            }
        }

        context.fillStyle = this.soundProp.color;
        context.fillText(text, 100 - l * 0.5, 34);

        this.dynamicTexture.update();
    }

    public rotDir: number = 1;
    private _lastDrawnTextIndex: number = 0;
    private _dir: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public update(dt: number): void {

        this._timer += dt;
        if (this._timer >= this.soundProp.duration) {
            this.isVisible = false;
        }
        else {
            if (this.soundProp.texts) {
                let textIndex = Math.floor(this._timer / this.soundProp.duration * this.soundProp.texts.length);
                if (textIndex != this._lastDrawnTextIndex) {
                    this.writeText(this.soundProp.texts[textIndex]);
                    this._lastDrawnTextIndex = textIndex;
                }
            }
            if (this.soundProp.type === ToonSoundType.Poc) {
                let fScale = 4 * this._timer / this.soundProp.duration;
                fScale = Nabu.MinMax(fScale, 0, 1);
                this.scale = fScale * this.soundProp.size;

                let fPos = 2 * this._timer / this.soundProp.duration;
                fPos = Nabu.MinMax(fPos, 0, 1);
                fPos = Nabu.Easing.easeOutSine(fPos);
                this.position.copyFrom(this.soundProp.pos);
                this.position.x += fPos * this.rotDir * this.soundProp.size * 0.5;
                this.position.z += fPos * this.soundProp.size * 0.5;

                this._dir.copyFrom(this.game.camera.globalPosition).subtractInPlace(this.position);
                Mummu.QuaternionFromYZAxisToRef(this._dir, BABYLON.Axis.Z.add(BABYLON.Axis.X.scale(0.1 * fPos * this.rotDir)), this.rotationQuaternion);

                this.visibility = 1;
            }
            else if (this.soundProp.type === ToonSoundType.Rumble) {
                this._dir.copyFrom(this.game.camera.globalPosition).subtractInPlace(this.position);
                Mummu.QuaternionFromYZAxisToRef(this._dir, BABYLON.Axis.Z.add(BABYLON.Axis.X.scale(0.1 * Math.sin(4 * 2 * Math.PI * this._timer))), this.rotationQuaternion);

                let f = 4 * this._timer / this.soundProp.duration;
                f = Nabu.MinMax(f, 0, 1);
                f = Nabu.Easing.easeOutCubic(f);
                this.scale = f * this.soundProp.size;
                this.position.copyFrom(this.soundProp.pos);
                this.position.y += f * 0.5 + 0.05 * Math.sin(6 * 2 * Math.PI * this._timer);
    
                this.visibility = 1;
            }
        }
    }
}

class ToonSoundManager {
    
    public sounds: ToonSound[] = [];

    constructor(
        public game: Game
    ) {
        this.sounds = [];
        for (let i = 0; i < 10; i++) {
            this.sounds[i] = new ToonSound(this.game);
        }
    }

    public start(soundProps: IToonSoundProp): void {
        return;
        for (let i = 0; i < 10; i++) {
            if (!this.sounds[i].active) {
                this.sounds[i].start(soundProps);
                return;
            }
        }
    }

    public update(dt: number): void {
        return;
        for (let i = 0; i < 10; i++) {
            if (this.sounds[i].active) {
                this.sounds[i].update(dt);
            }
        }
    }
}
*/ 
class UserInterfaceInputManager {
    constructor(game) {
        this.game = game;
        this.inControl = false;
        this.onUpCallbacks = new Nabu.UniqueList();
        this.onLeftCallbacks = new Nabu.UniqueList();
        this.onDownCallbacks = new Nabu.UniqueList();
        this.onRightCallbacks = new Nabu.UniqueList();
        this.onEnterCallbacks = new Nabu.UniqueList();
        this.onBackCallbacks = new Nabu.UniqueList();
        this.onPrevCallbacks = new Nabu.UniqueList();
        this.onNextCallbacks = new Nabu.UniqueList();
        this.onDropControlCallbacks = new Nabu.UniqueList();
    }
    initialize() {
        window.addEventListener("pointerdown", () => {
            if (this.inControl) {
                this.inControl = false;
                this.onDropControlCallbacks.forEach(cb => {
                    cb();
                });
            }
        });
        window.addEventListener("pointermove", () => {
            if (this.inControl) {
                this.inControl = false;
                this.onDropControlCallbacks.forEach(cb => {
                    cb();
                });
            }
        });
        window.addEventListener("keydown", (ev) => {
            if (document.activeElement instanceof HTMLInputElement) {
                if (ev.code === "Enter") {
                    this.game.canvas.focus();
                }
                return;
            }
            if (document.activeElement instanceof HTMLTextAreaElement) {
                return;
            }
            this.inControl = true;
            if (ev.code === "KeyW" || ev.code === "ArrowUp") {
                ev.preventDefault();
                this.onUpCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                ev.preventDefault();
                this.onLeftCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyS" || ev.code === "ArrowDown") {
                ev.preventDefault();
                this.onDownCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyD" || ev.code === "ArrowRight") {
                ev.preventDefault();
                this.onRightCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Enter" || ev.code === "Space" || ev.code === "KeyE") {
                ev.preventDefault();
                this.onEnterCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Backspace" || ev.code === "KeyX") {
                ev.preventDefault();
                this.onBackCallbacks.forEach(cb => {
                    cb();
                });
            }
        });
    }
}
var LifeState;
(function (LifeState) {
    LifeState[LifeState["Folded"] = 0] = "Folded";
    LifeState[LifeState["Ok"] = 1] = "Ok";
    LifeState[LifeState["Dying"] = 2] = "Dying";
    LifeState[LifeState["Disposed"] = 3] = "Disposed";
})(LifeState || (LifeState = {}));
class Creature extends BABYLON.Mesh {
    constructor(name, game) {
        super(name);
        this.game = game;
        this._lifeState = LifeState.Folded;
        this.hitpoint = 1;
        this.stamina = 10;
        this.speed = 1;
        this.currentSpeed = 0;
        this.bounty = 10;
    }
    get lifeState() {
        if (this.isDisposed()) {
            return LifeState.Disposed;
        }
        return this._lifeState;
    }
    set lifeState(s) {
        this._lifeState = s;
    }
    get isAlive() {
        return this.hitpoint > 0;
    }
    barycenterWorldPositionToRef(ref) {
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0, 0.5, 0), this.getWorldMatrix(), ref);
    }
    setWorldPosition(p) {
        this.position.copyFrom(p);
    }
    wound(amount) {
        if (this.isAlive) {
            this.hitpoint -= amount;
            if (this.hitpoint <= 0) {
                this.kill();
            }
        }
    }
    async instantiate() { }
    update(dt) { }
    async fold() { }
    async unfold() { }
    async kill() {
        this.dispose();
    }
}
var CreepNames = [
    "dodo"
];
var CreepHexColors = [
    "#334152",
    "red",
    "white"
];
class CreatureFactory {
    static CreateCreep(name, game) {
        if (name === "dodo") {
            return new Dodo("dodo", game, {
                speed: 1,
                stepDuration: 0.8,
                color: new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
                bounty: 10
            });
        }
    }
}
/// <reference path="Creature.ts"/>
class Dodo extends Creature {
    constructor(name, game, prop) {
        super(name, game);
        this.stepDuration = 0.4;
        this.colors = [];
        this.targetLook = BABYLON.Vector3.Zero();
        this.bodyTargetPos = BABYLON.Vector3.Zero();
        this.bodyVelocity = BABYLON.Vector3.Zero();
        //public topEyelids: BABYLON.Mesh[];
        //public bottomEyelids: BABYLON.Mesh[];
        //public wing: BABYLON.Mesh;
        //public canon: BABYLON.Mesh;
        this.stepHeight = 0.65;
        this.foldedBodyHeight = 0.2;
        this.unfoldedBodyHeight = 1.5;
        this.bodyHeight = this.unfoldedBodyHeight;
        this.animateWait = Mummu.AnimationFactory.EmptyVoidCallback;
        this.animateBodyHeight = Mummu.AnimationFactory.EmptyNumberCallback;
        this.upperLegLength = 0.8;
        this.lowerLegLength = 1;
        this.walking = 0;
        this.footIndex = 0;
        this.colors = [
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random())
        ];
        if (prop) {
            if (isFinite(prop.speed)) {
                this.speed = prop.speed;
            }
            if (isFinite(prop.stepDuration)) {
                this.stepDuration = prop.stepDuration;
            }
            if (isFinite(prop.bounty)) {
                this.bounty = prop.bounty;
            }
            if (prop.color) {
                this.colors[0] = prop.color;
            }
        }
        this.brain = new Brain(this);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.body = Dodo.OutlinedMesh("body");
        this.head = Dodo.OutlinedMesh("head");
        this.head.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.eyes = [
            Dodo.OutlinedMesh("eyeR"),
            Dodo.OutlinedMesh("eyeL")
        ];
        this.eyes[0].parent = this.head;
        this.eyes[0].position.copyFromFloats(0.218532, 0.200658, 0.242955);
        this.eyes[1].parent = this.head;
        this.eyes[1].position.copyFromFloats(-0.218532, 0.200658, 0.242955);
        /*
        this.topEyelids = [
            Dodo.OutlinedMesh("topEyelidR"),
            Dodo.OutlinedMesh("topEyelidL")
        ];
        this.topEyelids[0].parent = this.head;
        this.topEyelids[0].position.copyFromFloats(0.236, 0.046, 0.705);
        this.topEyelids[0].rotation.x = Math.PI / 4;
        this.topEyelids[1].parent = this.head;
        this.topEyelids[1].position.copyFromFloats(-0.236, 0.046, 0.705);
        this.topEyelids[1].rotation.x = Math.PI / 4;

        this.bottomEyelids = [
            Dodo.OutlinedMesh("bottomEyelidR"),
            Dodo.OutlinedMesh("bottomEyelidL")
        ];
        this.bottomEyelids[0].parent = this.head;
        this.bottomEyelids[0].position.copyFromFloats(0.236, 0.046, 0.705);
        this.bottomEyelids[0].rotation.x = - Math.PI / 4;
        this.bottomEyelids[1].parent = this.head;
        this.bottomEyelids[1].position.copyFromFloats(-0.236, 0.046, 0.705);
        this.bottomEyelids[1].rotation.x = - Math.PI / 4;

        this.canon = Dodo.OutlinedMesh("canon");
        this.canon.position.copyFromFloats(0, - 0.04, 0.46);
        this.canon.parent = this.body;

        if (prop && prop.hasWings) {
            this.wing = Dodo.OutlinedMesh("body");
            this.wing.parent = this.body;
        }
        */
        this.upperLegs = [
            Dodo.OutlinedMesh("upperLegR"),
            Dodo.OutlinedMesh("upperLegL")
        ];
        this.upperLegs[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.upperLegs[1].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.lowerLegs = [
            Dodo.OutlinedMesh("lowerLegR"),
            Dodo.OutlinedMesh("lowerLegL")
        ];
        this.lowerLegs[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.lowerLegs[1].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.feet = [
            new DodoFoot("footR", this),
            new DodoFoot("footL", this)
        ];
        this.feet[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.feet[1].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.neck = new BABYLON.Mesh("neck");
        this.hitCollider = new BABYLON.Mesh("hit-collider");
        this.hitCollider.parent = this;
        this.hitCollider.isVisible = false;
        this.hitCollider.parent = this.body;
        this.animateWait = Mummu.AnimationFactory.CreateWait(this);
        this.animateBodyHeight = Mummu.AnimationFactory.CreateNumber(this, this, "bodyHeight", undefined, undefined, Nabu.Easing.easeInOutSine);
        /*
        this.animateCanonRotX = Mummu.AnimationFactory.CreateNumber(this, this.canon.rotation, "x");
        this.animateTopEyeLids = [
            Mummu.AnimationFactory.CreateNumber(this.topEyelids[0], this.topEyelids[0].rotation, "x"),
            Mummu.AnimationFactory.CreateNumber(this.topEyelids[1], this.topEyelids[1].rotation, "x")
        ];
        this.animateBottomEyeLids = [
            Mummu.AnimationFactory.CreateNumber(this.bottomEyelids[0], this.bottomEyelids[0].rotation, "x"),
            Mummu.AnimationFactory.CreateNumber(this.bottomEyelids[1], this.bottomEyelids[1].rotation, "x")
        ];
        */
    }
    static OutlinedMesh(name) {
        let mesh = new BABYLON.Mesh(name);
        //mesh.renderOutline = true;
        //mesh.outlineColor.copyFromFloats(0, 0, 0);
        //mesh.outlineWidth = 0.03;
        return mesh;
    }
    async instantiate() {
        this.material = this.game.defaultToonMaterial;
        this.body.material = this.material;
        this.head.material = this.material;
        this.eyes[0].material = this.material;
        this.eyes[1].material = this.material;
        //this.topEyelids[0].material = this.material;
        //this.topEyelids[1].material = this.material;
        //this.bottomEyelids[0].material = this.material;
        //this.bottomEyelids[1].material = this.material;
        this.upperLegs[0].material = this.material;
        this.upperLegs[1].material = this.material;
        this.lowerLegs[0].material = this.material;
        this.lowerLegs[1].material = this.material;
        //this.tailEnd.material = this.material;
        this.neck.material = this.material;
        let datas = await this.game.vertexDataLoader.get("./datas/meshes/dodo.babylon");
        datas = datas.map(vertexData => {
            let clonedVertexData = Mummu.CloneVertexData(vertexData);
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[0], new BABYLON.Color3(0, 1, 0));
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[1], new BABYLON.Color3(0, 0, 1));
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[2], new BABYLON.Color3(1, 0, 0));
            return clonedVertexData;
        });
        datas[0].applyToMesh(this.body);
        datas[3].applyToMesh(this.head);
        datas[4].applyToMesh(this.eyes[0]);
        datas[4].applyToMesh(this.eyes[1]);
        //datas[3].applyToMesh(this.topEyelids[0]);
        //datas[3].applyToMesh(this.topEyelids[1]);
        //datas[4].applyToMesh(this.bottomEyelids[0]);
        //datas[4].applyToMesh(this.bottomEyelids[1]);
        datas[1].applyToMesh(this.upperLegs[0]);
        datas[1].applyToMesh(this.upperLegs[1]);
        datas[2].applyToMesh(this.lowerLegs[0]);
        datas[2].applyToMesh(this.lowerLegs[1]);
        await this.feet[0].instantiate();
        await this.feet[1].instantiate();
        //datas[1].applyToMesh(this.upperLegs[0]);
        //datas[1].applyToMesh(this.upperLegs[1]);
        //this.upperLegs[1].scaling.copyFromFloats(-1, 1, 1);
        //datas[2].applyToMesh(this.lowerLegs[0]);
        //datas[2].applyToMesh(this.lowerLegs[1]);
        //this.lowerLegs[1].scaling.copyFromFloats(-1, 1, 1);
        //datas[3].applyToMesh(this.feet[0]);
        //datas[3].applyToMesh(this.feet[1]);
        //this.feet[1].scaling.copyFromFloats(-1, 1, 1);
        datas[0].applyToMesh(this.hitCollider);
        //datas[10].applyToMesh(this);
        /*
        let base = BABYLON.MeshBuilder.CreateSphere("base", { diameter: 0.3 });
        base.parent = this;
        base.material = material;
        
        let dir = BABYLON.MeshBuilder.CreateBox("dir", { width: 0.1, height: 0.3, depth: 1 });
        dir.position.z = 0.5;
        dir.parent = this;
        dir.material = material;
        */
        this.hitpoint = this.stamina;
        setInterval(() => {
            this.eyeBlink();
        }, 5000);
    }
    dispose() {
        super.dispose();
        this.feet[0].dispose();
        this.feet[1].dispose();
        this.upperLegs[0].dispose();
        this.upperLegs[1].dispose();
        this.lowerLegs[0].dispose();
        this.lowerLegs[1].dispose();
        this.body.dispose();
        this.head.dispose();
        this.neck.dispose();
        //this.tailEnd.dispose();
    }
    setWorldPosition(p) {
        this.position.copyFrom(p);
        this.computeWorldMatrix(true);
        this.body.position.copyFrom(p);
        this.body.position.y += this.bodyHeight;
        let pRight = new BABYLON.Vector3(0.4, 0.2, this.speed * 0.2);
        BABYLON.Vector3.TransformCoordinatesToRef(pRight, this.getWorldMatrix(), this.feet[0].position);
        let pLeft = new BABYLON.Vector3(-0.4, 0.2, this.speed * 0.2);
        BABYLON.Vector3.TransformCoordinatesToRef(pLeft, this.getWorldMatrix(), this.feet[1].position);
    }
    barycenterWorldPositionToRef(ref) {
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0, 0.2, 0.2), this.body.getWorldMatrix(), ref);
    }
    async fold() {
        this.lifeState = LifeState.Folded;
        await this.animateBodyHeight(this.foldedBodyHeight, 1.5);
    }
    async unfold() {
        await this.animateBodyHeight(this.unfoldedBodyHeight, 1.5);
        this.lifeState = LifeState.Ok;
    }
    async kill() {
        if (this.lifeState >= LifeState.Dying) {
            return;
        }
        this.lifeState = LifeState.Dying;
        await this.animateWait(0.3);
        this.blink(1);
        await this.animateBodyHeight(1.02, 1, Nabu.Easing.easeOutElastic);
        let explosionCloud = new Explosion(this.game);
        explosionCloud.origin.copyFrom(this.body.absolutePosition);
        explosionCloud.setRadius(0.6);
        explosionCloud.color = new BABYLON.Color3(0.2, 0.2, 0.2);
        explosionCloud.lifespan = 3;
        explosionCloud.maxOffset = new BABYLON.Vector3(0, 0.4, 0);
        explosionCloud.tZero = 0.8;
        explosionCloud.boom();
        await this.animateWait(0.1);
        let explosionFire = new Explosion(this.game);
        explosionFire.origin.copyFrom(this.body.absolutePosition);
        explosionFire.setRadius(0.45);
        explosionFire.color = BABYLON.Color3.FromHexString("#ff7b00");
        explosionFire.lifespan = 1;
        explosionFire.tZero = 1;
        explosionFire.boom();
        let explosionFireYellow = new Explosion(this.game);
        explosionFireYellow.origin.copyFrom(this.body.absolutePosition);
        explosionFireYellow.setRadius(0.45);
        explosionFireYellow.color = BABYLON.Color3.FromHexString("#ffdd00");
        explosionFireYellow.lifespan = 1;
        explosionFireYellow.tZero = 1;
        explosionFireYellow.boom();
        this.body.visibility = 0;
        this.body.getChildMeshes().forEach(child => {
            child.visibility = 0;
        });
        await this.animateWait(2);
        await this.animateBodyHeight(this.foldedBodyHeight, 0.5, Nabu.Easing.easeInCubic);
        await this.animateWait(0.3);
        this.dispose();
    }
    async blink(duration) {
        let t0 = performance.now() / 1000;
        let t = performance.now() / 1000;
        while (t - t0 < duration) {
            await this.animateWait(0.04);
            await this.animateWait(0.08);
            this.body.material = this.game.defaultToonMaterial;
            await this.animateWait(0.04);
        }
    }
    async animateFoot(foot, target, targetQ) {
        return new Promise(resolve => {
            let origin = foot.position.clone();
            let dist = BABYLON.Vector3.Distance(origin, target);
            let duration = this.stepDuration;
            let originQ = foot.rotationQuaternion.clone();
            let t0 = performance.now() / 1000;
            let step = () => {
                let t = performance.now() / 1000;
                let f = (t - t0) / duration;
                if (f < 1) {
                    f = Nabu.Easing.easeInSine(f);
                    BABYLON.Quaternion.SlerpToRef(originQ, targetQ, f, foot.rotationQuaternion);
                    BABYLON.Vector3.LerpToRef(origin, target, f, foot.position);
                    foot.position.y += Math.min(dist, this.stepHeight) * Math.sin(f * Math.PI);
                    requestAnimationFrame(step);
                }
                else {
                    foot.position.copyFrom(target);
                    foot.rotationQuaternion.copyFrom(targetQ);
                    resolve();
                }
            };
            step();
        });
    }
    walk() {
        if (this.walking === 0 && this.isAlive) {
            let xFactor = this.footIndex === 0 ? 1 : -1;
            let spread = 0.7 - 0.2 * this.currentSpeed / this.speed;
            let pos = new BABYLON.Vector3(xFactor * spread, 0.15, this.speed * 0.2);
            let up = BABYLON.Vector3.Up();
            BABYLON.Vector3.TransformCoordinatesToRef(pos, this.getWorldMatrix(), pos);
            let ray = new BABYLON.Ray(pos.add(new BABYLON.Vector3(0, 1, 0)), new BABYLON.Vector3(0, -1, 0));
            let pick = this._scene.pickWithRay(ray, (mesh => {
                return mesh.name.startsWith("chunck");
            }));
            if (pick.hit) {
                pos = pick.pickedPoint;
                up = pick.getNormal(true, false);
            }
            let foot = this.feet[this.footIndex];
            if (BABYLON.Vector3.DistanceSquared(foot.position, pos.add(up.scale(0.15))) > 0.05) {
                this.walking = 1;
                let footDir = this.forward.add(this.right.scale(0.5 * xFactor)).normalize();
                foot.groundPos = pos;
                foot.groundUp = up;
                this.animateFoot(foot, pos.add(up.scale(0.15)), Mummu.QuaternionFromYZAxis(up, footDir)).then(() => {
                    this.walking = 0;
                    this.footIndex = (this.footIndex + 1) % 2;
                });
            }
            else {
                this.footIndex = (this.footIndex + 1) % 2;
            }
        }
    }
    static FlatManhattan(from, to) {
        return Math.abs(from.x - to.x) + Math.abs(from.z - to.z);
    }
    update(dt) {
        this.brain.update(dt);
        this.walk();
        let f = 0.5;
        let dy = this.feet[1].position.y - this.feet[0].position.y;
        f += dy / this.stepHeight * 0.4;
        f = Nabu.MinMax(f, 0.2, 0.8);
        this.bodyTargetPos.copyFrom(this.feet[0].position.scale(f)).addInPlace(this.feet[1].position.scale(1 - f));
        this.bodyTargetPos.addInPlace(this.forward.scale(this.currentSpeed * 0));
        this.bodyTargetPos.y += this.bodyHeight;
        let pForce = this.bodyTargetPos.subtract(this.body.position);
        pForce.scaleInPlace(40 * dt);
        this.bodyVelocity.addInPlace(pForce);
        this.bodyVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.5));
        //if (this.bodyVelocity.length() > this.speed * 3) {
        //    this.bodyVelocity.normalize().scaleInPlace(this.speed * 3);
        //} 
        this.body.position.addInPlace(this.bodyVelocity.scale(dt));
        //this.body.position.copyFrom(this.bodyTargetPos);
        let right = this.feet[0].position.subtract(this.feet[1].position);
        right.normalize();
        right.addInPlace(this.right.scale(1.5));
        right.normalize();
        this.body.rotationQuaternion = BABYLON.Quaternion.Slerp(this.rotationQuaternion, Mummu.QuaternionFromXYAxis(right, this.up), 0.9);
        this.body.freezeWorldMatrix();
        let hipR = new BABYLON.Vector3(0.72, 0, -0.34);
        BABYLON.Vector3.TransformCoordinatesToRef(hipR, this.body.getWorldMatrix(), hipR);
        let kneeR = hipR.clone().addInPlace(this.feet[0].position).scaleInPlace(0.5);
        kneeR.subtractInPlace(this.forward);
        kneeR.addInPlace(this.right.scale(0.1));
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.QuaternionFromZYAxisToRef(kneeR.subtract(hipR), hipR.subtract(this.feet[0].position), this.upperLegs[0].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[0].position.subtract(kneeR), hipR.subtract(this.feet[0].position), this.lowerLegs[0].rotationQuaternion);
        this.upperLegs[0].position.copyFrom(hipR);
        this.lowerLegs[0].position.copyFrom(kneeR);
        let hipL = new BABYLON.Vector3(-0.72, 0, -0.34);
        BABYLON.Vector3.TransformCoordinatesToRef(hipL, this.body.getWorldMatrix(), hipL);
        let kneeL = hipL.clone().addInPlace(this.feet[1].position).scaleInPlace(0.5);
        kneeL.subtractInPlace(this.forward);
        kneeL.subtractInPlace(this.right.scale(0.1));
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.QuaternionFromZYAxisToRef(kneeL.subtract(hipL), hipL.subtract(this.feet[1].position), this.upperLegs[1].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[1].position.subtract(kneeL), hipL.subtract(this.feet[1].position), this.lowerLegs[1].rotationQuaternion);
        this.upperLegs[1].position.copyFrom(hipL);
        this.lowerLegs[1].position.copyFrom(kneeL);
        let neck = new BABYLON.Vector3(0, 1.4, 1.2);
        BABYLON.Vector3.TransformCoordinatesToRef(neck, this.body.getWorldMatrix(), neck);
        this.head.position.copyFrom(neck);
        let forward = this.forward;
        if (this.targetLook) {
            forward.copyFrom(this.targetLook).subtractInPlace(neck).normalize();
        }
        let q = Mummu.QuaternionFromZYAxis(forward, this.up);
        BABYLON.Quaternion.SlerpToRef(this.head.rotationQuaternion, BABYLON.Quaternion.Slerp(this.body.rotationQuaternion, q, 0.5), 0.01, this.head.rotationQuaternion);
        let db = this.head.absolutePosition.add(this.head.forward.scale(0.5)).subtract(this.bodyTargetPos);
        db.scaleInPlace(2);
        let rComp = this.right.scale(BABYLON.Vector3.Dot(db, this.right));
        db.subtractInPlace(rComp.scale(2));
        let tailPoints = [new BABYLON.Vector3(0, -0.1, 0.5), new BABYLON.Vector3(0, 0.5, 1.1), this.head.absolutePosition];
        BABYLON.Vector3.TransformCoordinatesToRef(tailPoints[0], this.body.getWorldMatrix(), tailPoints[0]);
        BABYLON.Vector3.TransformCoordinatesToRef(tailPoints[1], this.body.getWorldMatrix(), tailPoints[1]);
        let dir = new BABYLON.Vector3(0, -1, 0);
        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward, dir);
        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward, dir);
        let data = Mummu.CreateWireVertexData({
            path: tailPoints,
            radiusFunc: (f) => {
                return 0.5 - 0.35 * f;
            },
            tesselation: 8,
            pathUps: tailPoints.map(() => { return this.body.up.subtract(this.body.forward); }),
            color: BABYLON.Color4.FromColor3(this.colors[1])
        });
        data.applyToMesh(this.neck);
        /*
        let dFoot = BABYLON.Vector3.Dot(this.feet[0].position.subtract(this.feet[1].position), this.forward);
        if (dFoot > 0) {
            let a = dFoot * Math.PI * 0.3;
            let up = this.feet[1].groundUp;
            up = Mummu.Rotate(up, this.feet[1].right, a);
            this.feet[1].rotationQuaternion = Mummu.QuaternionFromYZAxis(up, this.feet[1].forward);
        }
        else {
            let a = - dFoot * Math.PI * 0.3;
            let up = this.feet[0].groundUp;
            up = Mummu.Rotate(up, this.feet[0].right, a);
            this.feet[0].rotationQuaternion = Mummu.QuaternionFromYZAxis(up, this.feet[0].forward);
        }
        */
        this.feet[0].update(dt);
        this.feet[1].update(dt);
    }
    async eyeBlink(eyeIndex = -1) {
        let eyeIndexes = [0, 1];
        if (eyeIndex != -1) {
            eyeIndexes = [eyeIndex];
        }
        eyeIndexes.forEach(i => {
            //this.animateTopEyeLids[i](Math.PI / 2, 0.15)
            //this.animateBottomEyeLids[i](- Math.PI / 2, 0.15)
        });
        await this.animateWait(0.25);
        eyeIndexes.forEach(i => {
            //this.animateTopEyeLids[i](Math.PI / 4, 0.15)
            //this.animateBottomEyeLids[i](- Math.PI / 4, 0.15)
        });
        await this.animateWait(0.15);
    }
}
class DodoFoot extends BABYLON.Mesh {
    constructor(name, joey) {
        super(name);
        this.joey = joey;
        this.groundPos = BABYLON.Vector3.Zero();
        this.groundUp = BABYLON.Vector3.Up();
        this.scaling.copyFromFloats(1.3, 1.3, 1.3);
        this.claws = [
            Dodo.OutlinedMesh("clawR"),
            Dodo.OutlinedMesh("clawL"),
            Dodo.OutlinedMesh("clawB")
        ];
        this.claws[0].position.copyFromFloats(-0.103, -0.025, 0.101);
        this.claws[0].rotation.y = -Math.PI / 8;
        this.claws[0].parent = this;
        this.claws[1].position.copyFromFloats(0.103, -0.025, 0.101);
        this.claws[1].rotation.y = Math.PI / 8;
        this.claws[1].parent = this;
        this.claws[2].position.copyFromFloats(0, -0.025, -0.101);
        this.claws[2].rotation.y = Math.PI;
        this.claws[2].parent = this;
    }
    async instantiate() {
        let datas = await this.joey.game.vertexDataLoader.get("./datas/meshes/dodo.babylon");
        datas = datas.map(vertexData => {
            return Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(vertexData), this.joey.colors[2], new BABYLON.Color3(0, 1, 0));
        });
        //datas[8].applyToMesh(this);
        this.material = this.joey.material;
        //datas[9].applyToMesh(this.claws[0]);
        //datas[9].applyToMesh(this.claws[1]);
        //datas[9].applyToMesh(this.claws[2]);
        this.claws[0].material = this.joey.material;
        this.claws[1].material = this.joey.material;
        this.claws[2].material = this.joey.material;
    }
    update(dt) {
        for (let i = 0; i < this.claws.length; i++) {
            let clawTip = new BABYLON.Vector3(0, 0, 0.26);
            BABYLON.Vector3.TransformCoordinatesToRef(clawTip, this.claws[i].getWorldMatrix(), clawTip);
            let dP = clawTip.subtract(this.groundPos);
            let dot = BABYLON.Vector3.Dot(dP, this.groundUp);
            if (dot > 0) {
                this.claws[i].rotation.x += 0.2 * Math.PI * dt;
            }
            else if (dP.length() < 1) {
                this.claws[i].rotation.x += 50 * dot * Math.PI * dt;
            }
            this.claws[i].rotation.x = Nabu.MinMax(this.claws[i].rotation.x, -Math.PI * 0.4, Math.PI * 0.5);
        }
    }
}
var BrainMode;
(function (BrainMode) {
    BrainMode[BrainMode["Idle"] = 0] = "Idle";
    BrainMode[BrainMode["Travel"] = 1] = "Travel";
})(BrainMode || (BrainMode = {}));
class Brain {
    constructor(joey) {
        this.joey = joey;
        this.mode = BrainMode.Idle;
        this.subBrains = [];
        this.subBrains[BrainMode.Idle] = new BrainIdle(this);
        this.subBrains[BrainMode.Travel] = new BrainTravel(this);
    }
    get terrain() {
        return this.joey.game.terrain;
    }
    update(dt) {
        if (this.mode === BrainMode.Idle) {
            if (Math.random() < 0.005) {
                this.subBrains[BrainMode.Travel].onReach = () => {
                    this.mode = BrainMode.Idle;
                };
                this.subBrains[BrainMode.Travel].onCantFindPath = () => {
                    this.mode = BrainMode.Idle;
                };
                //this.mode = BrainMode.Travel;
            }
        }
        let subBrain = this.subBrains[this.mode];
        if (subBrain) {
            subBrain.update(dt);
        }
    }
}
class SubBrain {
    constructor(brain) {
        this.brain = brain;
    }
    get joey() {
        return this.brain.joey;
    }
    get terrain() {
        return this.brain.terrain;
    }
    update(dt) {
    }
}
/// <reference path="SubBrain.ts"/>
class BrainIdle extends SubBrain {
    constructor() {
        super(...arguments);
        this._targetQ = BABYLON.Quaternion.Identity();
        this._targetLook = BABYLON.Vector3.Zero();
        this._targetBodyHeight = 0.95;
    }
    update(dt) {
        if (Math.random() < 0.001) {
            let targetDir = this.joey.forward.clone();
            Mummu.RotateInPlace(targetDir, this.joey.up, (2 * Math.random() - 1) * Math.PI / 3);
            targetDir.normalize();
            Mummu.QuaternionFromZYAxisToRef(targetDir, this.joey.up, this._targetQ);
            this._targetBodyHeight = 0.8 + 0.4 * Math.random();
        }
        if (Math.random() < 0.003) {
            this._targetLook.copyFrom(this.joey.position);
            this._targetLook.addInPlace(this.joey.forward.scale(10));
            this._targetLook.x += Math.random() * 10 - 5;
            this._targetLook.y += Math.random() * 10 - 5;
            this._targetLook.z += Math.random() * 10 - 5;
        }
        this.joey.currentSpeed *= 0.99;
        BABYLON.Quaternion.SlerpToRef(this.joey.rotationQuaternion, this._targetQ, 0.01, this.joey.rotationQuaternion);
        this.joey.bodyHeight = this.joey.bodyHeight * 0.99 + this._targetBodyHeight * 0.01;
        BABYLON.Vector3.SlerpToRef(this.joey.targetLook, this._targetLook, 0.03, this.joey.targetLook);
    }
}
class BrainTravel extends SubBrain {
    constructor() {
        super(...arguments);
        this.onReach = () => { };
        this.onCantFindPath = () => { };
    }
    recomputePath() {
    }
    update(dt) {
    }
}
class CubicNoiseTexture {
    constructor(scene) {
        this.scene = scene;
        this.size = 1;
        this._data = [[[0.5]]];
    }
    getData(i, j, k) {
        while (i < 0) {
            i += this.size;
        }
        while (j < 0) {
            j += this.size;
        }
        while (k < 0) {
            k += this.size;
        }
        i = i % this.size;
        j = j % this.size;
        k = k % this.size;
        return this._data[i][j][k];
    }
    setData(v, i, j, k) {
        while (i < 0) {
            i += this.size;
        }
        while (j < 0) {
            j += this.size;
        }
        while (k < 0) {
            k += this.size;
        }
        i = i % this.size;
        j = j % this.size;
        k = k % this.size;
        return this._data[i][j][k];
    }
    double() {
        let newSize = this.size * 2;
        let newData = [];
        for (let i = 0; i < newSize; i++) {
            newData[i] = [];
            for (let j = 0; j < newSize; j++) {
                newData[i][j] = [];
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    let v = this._data[i][j][k];
                    newData[2 * i][2 * j][2 * k] = v;
                    newData[2 * i + 1][2 * j][2 * k] = v;
                    newData[2 * i + 1][2 * j + 1][2 * k] = v;
                    newData[2 * i][2 * j + 1][2 * k] = v;
                    newData[2 * i][2 * j][2 * k + 1] = v;
                    newData[2 * i + 1][2 * j][2 * k + 1] = v;
                    newData[2 * i + 1][2 * j + 1][2 * k + 1] = v;
                    newData[2 * i][2 * j + 1][2 * k + 1] = v;
                }
            }
        }
        this.size = newSize;
        this._data = newData;
    }
    smooth() {
        let newData = [];
        for (let i = 0; i < this.size; i++) {
            newData[i] = [];
            for (let j = 0; j < this.size; j++) {
                newData[i][j] = [];
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    let val = 0;
                    let c = 0;
                    for (let ii = -1; ii <= 1; ii++) {
                        for (let jj = -1; jj <= 1; jj++) {
                            for (let kk = -1; kk <= 1; kk++) {
                                let d = Math.sqrt(ii * ii + jj * jj + kk * kk);
                                let w = 2 - d;
                                let v = this.getData(i + ii, j + jj, k + kk);
                                val += w * v;
                                c += w;
                            }
                        }
                    }
                }
            }
        }
    }
    noise() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    this._data[i][j][k] = (this._data[i][j][k] + Math.random()) * 0.5;
                }
            }
        }
    }
    randomize() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    this._data[i][j][k] = Math.random();
                }
            }
        }
    }
    get3DTexture() {
        let data = new Uint8ClampedArray(this.size * this.size * this.size);
        let min = 255;
        let max = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    data[i + j * this.size + k * this.size * this.size] = 256 * this._data[i][j][k];
                    min = Math.min(min, data[i + j * this.size + k * this.size * this.size]);
                    max = Math.max(max, data[i + j * this.size + k * this.size * this.size]);
                }
            }
        }
        let tex = new BABYLON.RawTexture3D(data, this.size, this.size, this.size, BABYLON.Constants.TEXTUREFORMAT_R, this.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE);
        tex.wrapU = 1;
        tex.wrapV = 1;
        tex.wrapR = 1;
        return tex;
    }
}
class Explosion {
    constructor(game) {
        this.game = game;
        this.origin = BABYLON.Vector3.Zero();
        this.lifespan = 2;
        this.tZero = 0;
        this.particles = [];
        this.particulesCount = 10;
        this.particuleRadius = 1;
        this.targetPositions = [];
        this.delays = [];
        this.radiusXZ = 1;
        this.radiusY = 1;
        this.maxOffset = BABYLON.Vector3.Zero();
        this.keepAlive = false;
        this._timer = 0;
        this.update = () => {
            if (!this.game.performanceWatcher.supportTexture3D) {
                return;
            }
            this._timer += this.game.scene.deltaTime / 1000;
            let globalF = 1;
            let done = true;
            for (let i = 0; i < this.particles.length; i++) {
                let bubble = this.particles[i];
                let f = (this._timer - this.delays[i]) / this.lifespan;
                if (f < 1) {
                    done = false;
                }
                globalF = Math.min(globalF, f);
                f = Nabu.MinMax(f, 0, 1);
                let fScale = 0;
                let fPos = 0;
                if (this.sizeEasing) {
                    fScale = this.sizeEasing(f);
                    fPos = this.sizeEasing(f);
                }
                else {
                    fScale = Nabu.Easing.easeOutCubic(Nabu.Easing.easeOutCubic(f));
                    fPos = Nabu.Easing.easeOutCubic(Nabu.Easing.easeOutCubic(f));
                }
                BABYLON.Vector3.LerpToRef(this.origin, this.targetPositions[i], fPos, bubble.position);
                bubble.rotate(BABYLON.Axis.Y, 0.01, BABYLON.Space.LOCAL);
                bubble.scaling.copyFromFloats(fScale, fScale, fScale);
            }
            this.bubbleMaterial.setFloat("time", 2 * globalF + this.tZero);
            if (done) {
                if (this.keepAlive) {
                    for (let i = 0; i < this.particles.length; i++) {
                        this.particles[i].isVisible = false;
                    }
                    this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
                }
                else {
                    this.dispose();
                }
            }
        };
        if (this.game.performanceWatcher.supportTexture3D) {
            this.bubbleMaterial = new ExplosionMaterial("explosion-material", this.game.scene);
            this.bubbleMaterial.setUseLightFromPOV(true);
            this.bubbleMaterial.setAutoLight(0.8);
        }
    }
    setRadius(v) {
        this.radiusXZ = v;
        this.radiusY = v;
        this.particuleRadius = v;
    }
    get color() {
        if (this.bubbleMaterial) {
            return this.bubbleMaterial.diffuse;
        }
        return BABYLON.Color3.White();
    }
    set color(c) {
        if (this.bubbleMaterial) {
            this.bubbleMaterial.setDiffuse(c);
        }
    }
    static RandomInSphere() {
        let p = new BABYLON.Vector3(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random());
        while (p.lengthSquared() > 1) {
            p.copyFromFloats(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random());
        }
        return p;
    }
    dispose() {
        this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        while (this.particles.length > 0) {
            this.particles.pop().dispose();
        }
    }
    async MakeNoisedBlob(radius) {
        //await RandomWait();
        let data = await this.game.vertexDataLoader.getAtIndex("datas/meshes/explosion.babylon", 0);
        data = Mummu.CloneVertexData(data);
        data = Mummu.ScaleVertexDataInPlace(data, radius);
        let positions = [...data.positions];
        let delta = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        delta.scaleInPlace(radius * 0.5 * Math.random());
        for (let i = 0; i < positions.length / 3; i++) {
            positions[3 * i + 0] += delta.x;
            positions[3 * i + 1] += delta.y;
            positions[3 * i + 2] += delta.z;
        }
        data.positions = positions;
        return data;
    }
    async boom() {
        if (!this.game.performanceWatcher.supportTexture3D) {
            return;
        }
        this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        if (this.particles.length > 0 && this.particles.length != this.particulesCount) {
            while (this.particles.length > 0) {
                this.particles.pop().dispose();
            }
            this.targetPositions = [];
        }
        this._timer = 0;
        this.bubbleMaterial.setFloat("time", 0);
        this.bubbleMaterial.setVector3("origin", this.origin);
        this.bubbleMaterial.setFloat("radius", 2 * this.radiusXZ);
        this.bubbleMaterial.setTexture("noiseTexture", this.game.noiseTexture);
        for (let i = 0; i < this.particulesCount; i++) {
            let bubble = this.particles[i];
            if (!bubble) {
                bubble = new BABYLON.Mesh("bubble-" + i);
            }
            (await this.MakeNoisedBlob((0.6 + 0.4 * Math.random()) * this.particuleRadius)).applyToMesh(bubble);
            bubble.position.copyFrom(this.origin);
            bubble.material = this.bubbleMaterial;
            bubble.rotation.copyFromFloats(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            bubble.isVisible = true;
            let targetPosition = Explosion.RandomInSphere().multiplyInPlace(new BABYLON.Vector3(this.radiusXZ, this.radiusY, this.radiusXZ));
            targetPosition.addInPlace(this.origin);
            targetPosition.addInPlace(this.maxOffset);
            this.particles[i] = bubble;
            this.targetPositions[i] = targetPosition;
            this.delays[i] = 0.2 * Math.random() * this.lifespan;
        }
        this.game.scene.onBeforeRenderObservable.add(this.update);
    }
}
class ExplosionMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "explosion",
            fragment: "explosion",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: [
                "world", "worldView", "worldViewProjection", "view", "projection",
                "useVertexColor",
                "useLightFromPOV",
                "autoLight",
                "diffuseSharpness",
                "diffuse",
                "viewPositionW",
                "viewDirectionW",
                "lightInvDirW",
                "useFlatSpecular",
                "specularIntensity",
                "specularColor",
                "specularCount",
                "specularPower",
                "time",
                "origin",
                "radius"
            ],
            needAlphaBlending: true,
            needAlphaTesting: true
        });
        this._update = () => {
            let camera = this.getScene().activeCamera;
            let direction = camera.getForwardRay().direction;
            this.setVector3("viewPositionW", camera.globalPosition);
            this.setVector3("viewDirectionW", direction);
            let lights = this.getScene().lights;
            for (let i = 0; i < lights.length; i++) {
                let light = lights[i];
                if (light instanceof BABYLON.HemisphericLight) {
                    this.setVector3("lightInvDirW", light.direction);
                }
            }
        };
        this._useVertexColor = false;
        this._useLightFromPOV = false;
        this._autoLight = 0;
        this._diffuseSharpness = 0;
        this._diffuse = BABYLON.Color3.White();
        this._useFlatSpecular = false;
        this._specularIntensity = 0;
        this._specular = BABYLON.Color3.White();
        this._specularCount = 1;
        this._specularPower = 4;
        this.updateUseVertexColor();
        this.updateUseLightFromPOV();
        this.updateAutoLight();
        this.updateDiffuseSharpness();
        this.updateDiffuse();
        this.updateUseFlatSpecular();
        this.updateSpecularIntensity();
        this.updateSpecular();
        this.updateSpecularCount();
        this.updateSpecularPower();
        this.setVector3("viewPositionW", BABYLON.Vector3.Zero());
        this.setVector3("viewDirectionW", BABYLON.Vector3.Up());
        this.setVector3("lightInvDirW", BABYLON.Vector3.Up());
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        super.dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }
    get useVertexColor() {
        return this._useVertexColor;
    }
    setUseVertexColor(b) {
        this._useVertexColor = b;
        this.updateUseVertexColor();
    }
    updateUseVertexColor() {
        this.setInt("useVertexColor", this._useVertexColor ? 1 : 0);
    }
    get useLightFromPOV() {
        return this._useLightFromPOV;
    }
    setUseLightFromPOV(b) {
        this._useLightFromPOV = b;
        this.updateUseLightFromPOV();
    }
    updateUseLightFromPOV() {
        this.setInt("useLightFromPOV", this._useLightFromPOV ? 1 : 0);
    }
    get autoLight() {
        return this._autoLight;
    }
    setAutoLight(v) {
        this._autoLight = v;
        this.updateAutoLight();
    }
    updateAutoLight() {
        this.setFloat("autoLight", this._autoLight);
    }
    get diffuseSharpness() {
        return this._diffuseSharpness;
    }
    setDiffuseSharpness(v) {
        this._diffuseSharpness = v;
        this.updateDiffuseSharpness();
    }
    updateDiffuseSharpness() {
        this.setFloat("diffuseSharpness", this._diffuseSharpness);
    }
    get diffuse() {
        return this._diffuse;
    }
    setDiffuse(c) {
        this._diffuse = c;
        this.updateDiffuse();
    }
    updateDiffuse() {
        this.setColor3("diffuse", this._diffuse);
    }
    get useFlatSpecular() {
        return this._useFlatSpecular;
    }
    setUseFlatSpecular(b) {
        this._useFlatSpecular = b;
        this.updateUseFlatSpecular();
    }
    updateUseFlatSpecular() {
        this.setInt("useFlatSpecular", this._useFlatSpecular ? 1 : 0);
    }
    get specularIntensity() {
        return this._specularIntensity;
    }
    setSpecularIntensity(v) {
        this._specularIntensity = v;
        this.updateSpecularIntensity();
    }
    updateSpecularIntensity() {
        this.setFloat("specularIntensity", this._specularIntensity);
    }
    get specular() {
        return this._specular;
    }
    setSpecular(c) {
        this._specular = c;
        this.updateSpecular();
    }
    updateSpecular() {
        this.setColor3("specular", this._specular);
    }
    get specularCount() {
        return this._specularCount;
    }
    setSpecularCount(v) {
        this._specularCount = v;
        this.updateSpecularCount();
    }
    updateSpecularCount() {
        this.setFloat("specularCount", this._specularCount);
    }
    get specularPower() {
        return this._specularPower;
    }
    setSpecularPower(v) {
        this._specularPower = v;
        this.updateSpecularPower();
    }
    updateSpecularPower() {
        this.setFloat("specularPower", this._specularPower);
    }
}
class StampEffect {
    constructor(game) {
        this.game = game;
        this.sound = game.soundManager.createSound("stamp-sound", "./datas/sounds/stamp.mp3");
    }
    getScene() {
        return this.game.scene;
    }
    async play(div) {
        //await RandomWait();
        div.style.visibility = "hidden";
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        this.sound.play();
        div.style.transform = "scale(0.1)";
        div.style.transition = "all 0.2s";
        div.style.visibility = "";
        div.style.transform = "scale(1.3)";
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        div.style.transform = "scale(1)";
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        div.style.transition = "";
    }
}
function SineFlashVisibility(target, duration, min = 0, max = 1) {
    return new Promise(resolve => {
        let t0 = performance.now();
        let step = () => {
            let f = (performance.now() - t0) / 1000 / duration;
            if (f < 1) {
                target.visibility = min + Math.sin(f * Math.PI) * max;
                requestAnimationFrame(step);
            }
            else {
                target.visibility = min;
                resolve();
            }
        };
        step();
    });
}
function MakeQuad(i0, i1, i2, i3, indices, positions, flatShadingPositions) {
    if (positions && flatShadingPositions) {
        let l = flatShadingPositions.length / 3;
        let x0 = positions[3 * i0];
        let y0 = positions[3 * i0 + 1];
        let z0 = positions[3 * i0 + 2];
        let x1 = positions[3 * i1];
        let y1 = positions[3 * i1 + 1];
        let z1 = positions[3 * i1 + 2];
        let x2 = positions[3 * i2];
        let y2 = positions[3 * i2 + 1];
        let z2 = positions[3 * i2 + 2];
        let x3 = positions[3 * i3];
        let y3 = positions[3 * i3 + 1];
        let z3 = positions[3 * i3 + 2];
        flatShadingPositions.push(x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3);
        indices.push(l, l + 1, l + 2);
        indices.push(l, l + 2, l + 3);
    }
    else {
        indices.push(i0, i1, i2);
        indices.push(i0, i2, i3);
    }
}
function CreatePlaqueVertexData(w, h, m) {
    let plaqueData = new BABYLON.VertexData();
    let positions = [];
    let indices = [];
    let uvs = [];
    let xs = [0, m, w - m, w];
    let zs = [0, m, h - m, h];
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
            let l = positions.length / 3;
            let y = 0;
            if (i > 0 && i < 3 && j > 0 && j < 3) {
                y = m;
            }
            positions.push(xs[i], y, zs[j]);
            if (i < 3 && j < 3) {
                if (i === 0 && j === 2 || i === 2 && j === 0) {
                    indices.push(l, l + 1, l + 4);
                    indices.push(l + 4, l + 1, l + 1 + 4);
                }
                else {
                    indices.push(l, l + 1, l + 1 + 4);
                    indices.push(l, l + 1 + 4, l + 4);
                }
            }
            uvs.push(xs[i] / w, zs[j] / h);
        }
    }
    plaqueData.positions = positions;
    plaqueData.indices = indices;
    plaqueData.uvs = uvs;
    let normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    plaqueData.normals = normals;
    Mummu.TranslateVertexDataInPlace(plaqueData, new BABYLON.Vector3(-w * 0.5, 0, -h * 0.5));
    return plaqueData;
}
function CreateBoxFrameVertexData(props) {
    if (!isFinite(props.w)) {
        props.w = 1;
    }
    if (!isFinite(props.wBase)) {
        props.wBase = props.w;
    }
    if (!isFinite(props.wTop)) {
        props.wTop = props.w;
    }
    if (!isFinite(props.h)) {
        props.h = props.w;
    }
    if (!isFinite(props.d)) {
        props.d = 1;
    }
    if (!isFinite(props.dBase)) {
        props.dBase = props.d;
    }
    if (!isFinite(props.dTop)) {
        props.dTop = props.d;
    }
    if (!isFinite(props.thickness)) {
        props.thickness = props.w * 0.1;
    }
    if (!isFinite(props.innerHeight)) {
        props.innerHeight = props.h * 0.25;
    }
    let w2 = props.w / 2;
    let wBase2 = props.wBase / 2;
    let wTop2 = props.wTop / 2;
    let d2 = props.d / 2;
    let dBase2 = props.dBase / 2;
    let dTop2 = props.dTop / 2;
    let h = props.h;
    let t = props.thickness;
    let hh = props.innerHeight;
    let positions = [
        -wBase2, 0, -dBase2,
        wBase2, 0, -dBase2,
        wBase2, 0, dBase2,
        -wBase2, 0, dBase2,
        -w2, h, -d2,
        w2, h, -d2,
        w2, h, d2,
        -w2, h, d2,
        -w2 + t, h, -d2 + t,
        w2 - t, h, -d2 + t,
        w2 - t, h, d2 - t,
        -w2 + t, h, d2 - t,
        -wTop2 + t, h - hh, -dTop2 + t,
        wTop2 - t, h - hh, -dTop2 + t,
        wTop2 - t, h - hh, dTop2 - t,
        -wTop2 + t, h - hh, dTop2 - t
    ];
    let normalVec3s = [];
    let n0 = new BABYLON.Vector3(-1, props.bottomCap ? -1 : 0, -1);
    let n4 = new BABYLON.Vector3(-1, 1, -1);
    let n8 = new BABYLON.Vector3(1, 1, 1);
    let n12 = new BABYLON.Vector3(1, props.topCap ? 1 : 0, 1);
    normalVec3s.push(n0);
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    normalVec3s.push(n4);
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    normalVec3s.push(n8);
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    normalVec3s.push(n12);
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    let normals = [];
    for (let i = 0; i < normalVec3s.length; i++) {
        normalVec3s[i].normalize();
        normals.push(normalVec3s[i].x, normalVec3s[i].y, normalVec3s[i].z);
    }
    let basePositions = undefined;
    if (props.flatShading) {
        basePositions = [...positions];
        positions = [];
    }
    let indices = [];
    MakeQuad(0, 1, 5, 4, indices, basePositions, positions);
    MakeQuad(1, 2, 6, 5, indices, basePositions, positions);
    MakeQuad(2, 3, 7, 6, indices, basePositions, positions);
    MakeQuad(3, 0, 4, 7, indices, basePositions, positions);
    MakeQuad(4, 5, 9, 8, indices, basePositions, positions);
    MakeQuad(5, 6, 10, 9, indices, basePositions, positions);
    MakeQuad(6, 7, 11, 10, indices, basePositions, positions);
    MakeQuad(7, 4, 8, 11, indices, basePositions, positions);
    MakeQuad(8, 9, 13, 12, indices, basePositions, positions);
    MakeQuad(9, 10, 14, 13, indices, basePositions, positions);
    MakeQuad(10, 11, 15, 14, indices, basePositions, positions);
    MakeQuad(11, 8, 12, 15, indices, basePositions, positions);
    if (props.bottomCap) {
        MakeQuad(0, 3, 2, 1, indices, basePositions, positions);
    }
    if (props.topCap) {
        MakeQuad(12, 13, 14, 15, indices, basePositions, positions);
    }
    if (props.flatShading) {
        normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    }
    let colors = [];
    for (let i = 0; i < positions.length / 3; i++) {
        let y = positions[3 * i + 1];
        if (props.topCapColor && y === props.h - props.innerHeight) {
            colors.push(...props.topCapColor.asArray());
        }
        else {
            colors.push(1, 1, 1, 1);
        }
    }
    let vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.colors = colors;
    return vertexData;
}
function CreateTrailVertexData(props) {
    let data = new BABYLON.VertexData();
    let positions = [];
    let normals = [];
    let indices = [];
    let uvs = [];
    let colors = [];
    let path = [...props.path];
    let up = BABYLON.Vector3.Up();
    if (props.up) {
        up.copyFrom(props.up);
    }
    let n = path.length;
    let directions = [];
    let prev = path[0];
    let next = path[1];
    directions[0] = next.subtract(prev).normalize();
    for (let i = 1; i < n - 1; i++) {
        let prev = path[i - 1];
        let next = path[i + 1];
        directions[i] = next.subtract(prev).normalize();
    }
    prev = path[n - 2];
    next = path[n - 1];
    directions[n - 1] = next.subtract(prev).normalize();
    let cumulLength = 0;
    for (let i = 0; i < n; i++) {
        let p = path[i];
        if (i > 0) {
            cumulLength += BABYLON.Vector3.Distance(p, path[i - 1]);
        }
        let dir = directions[i];
        let xDir = BABYLON.Vector3.Cross(up, dir).normalize();
        let normal = BABYLON.Vector3.Cross(dir, xDir).normalize();
        let r = props.radius;
        if (props.radiusFunc) {
            r = props.radiusFunc(i / (n - 1));
        }
        let l = positions.length / 3;
        positions.push(p.x + xDir.x * r, p.y + xDir.y * r, p.z + xDir.z * r);
        positions.push(p.x - xDir.x * r, p.y - xDir.y * r, p.z - xDir.z * r);
        if (props.colors) {
            let col = props.colors[i];
            colors.push(col.r, col.g, col.b, col.a);
            colors.push(col.r, col.g, col.b, col.a);
        }
        else if (props.color) {
            let col = props.color;
            colors.push(col.r, col.g, col.b, col.a);
            colors.push(col.r, col.g, col.b, col.a);
        }
        else {
            colors.push(1, 1, 1, 1);
        }
        if (i < n - 1) {
            indices.push(l, l + 2, l + 1);
            indices.push(l + 1, l + 2, l + 3);
        }
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(1, i / (n - 1));
        uvs.push(0, i / (n - 1));
    }
    data.positions = positions;
    data.colors = colors;
    data.indices = indices;
    data.normals = normals;
    data.uvs = uvs;
    return data;
}
function CreateBiDiscVertexData(props) {
    let data = new BABYLON.VertexData();
    let positions = [];
    let normals = [];
    let indices = [];
    let uvs = [];
    let r1 = props.r1;
    let r2 = props.r2;
    let d = BABYLON.Vector3.Distance(props.p1, props.p2);
    let alpha = 0;
    if (d + r2 > r1) {
        alpha = Math.acos((r1 - r2) / d);
    }
    positions.push(0, 0, 0);
    let count1 = Math.round((2 * Math.PI - 2 * alpha) / (Math.PI / 32));
    let dA1 = (2 * Math.PI - 2 * alpha) / count1;
    for (let n = 0; n <= count1; n++) {
        let l = positions.length / 3;
        let a = Math.PI - alpha - n * dA1;
        let x = Math.cos(a) * r1;
        let z = Math.sin(a) * r1;
        positions.push(x, 0, z);
        if (n < count1) {
            indices.push(0, l + 1, l);
        }
    }
    if (alpha > 0) {
        let indexC2 = positions.length / 3;
        indices.push(indexC2, 0, 1);
        indices.push(indexC2, indexC2 - 1, 0);
        indices.push(indexC2, indexC2 + 1, indexC2 - 1);
        positions.push(-d, 0, 0);
        let count2 = Math.round((2 * alpha) / (Math.PI / 32));
        let dA2 = (2 * alpha) / count2;
        for (let n = 0; n <= count2; n++) {
            let l = positions.length / 3;
            let a = Math.PI + alpha - n * dA2;
            let x = -d + Math.cos(a) * r2;
            let z = Math.sin(a) * r2;
            positions.push(x, 0, z);
            if (n < count2) {
                indices.push(indexC2, l + 1, l);
            }
        }
        indices.push(positions.length / 3 - 1, indexC2, 1);
    }
    data.positions = positions;
    data.indices = indices;
    for (let i = 0; i < positions.length / 3; i++) {
        normals.push(0, 1, 0);
    }
    data.normals = normals;
    data.uvs = uvs;
    if (props.color) {
        let colors = [];
        let colArray = props.color.asArray();
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(...colArray);
        }
        data.colors = colors;
    }
    if (d + r2 > r1) {
        let rot = Mummu.AngleFromToAround(new BABYLON.Vector3(-1, 0, 0), props.p2.subtract(props.p1), BABYLON.Axis.Y);
        Mummu.RotateAngleAxisVertexDataInPlace(data, rot, BABYLON.Axis.Y);
    }
    Mummu.TranslateVertexDataInPlace(data, props.p1);
    return data;
}
var supportedLocales = [
    "en",
    "fr",
    "pl",
    "de",
    "nl",
    "pt",
    "it",
    "es"
];
let languages = navigator.languages;
for (let i = 0; i < languages.length; i++) {
    let language = languages[i];
    let languageRoot = language.split("-")[0];
    if (supportedLocales.indexOf(languageRoot) != -1) {
        LOCALE = languageRoot;
        break;
    }
}
class I18Nizer {
    static GetText(key, lang) {
        if (i18nData[key]) {
            if (i18nData[key][lang]) {
                return i18nData[key][lang];
            }
            return i18nData[key]["en"];
        }
        return "uknwn";
    }
    static Translate(lang) {
        let elements = document.querySelectorAll("[i18n-key]");
        elements.forEach(element => {
            if (element instanceof HTMLElement) {
                let key = element.getAttribute("i18n-key");
                if (key) {
                    element.innerText = I18Nizer.GetText(key, lang);
                }
            }
        });
    }
}
var i18nData = {};
// Homepage
i18nData["play"] = {
    "en": "PLAY",
    "fr": "JOUER"
};
i18nData["completed"] = {
    "en": "completed",
    "fr": "completé"
};
i18nData["home-story-mode"] = {
    "en": "story mode",
    "fr": "mode histoire"
};
i18nData["home-expert-mode"] = {
    "en": "expert mode",
    "fr": "mode expert"
};
i18nData["home-community-mode"] = {
    "en": "community puzzles",
    "fr": "puzzles custom"
};
// Intro Screen
i18nData["intro-to-play-keyboard"] = {
    "en": "Click to play",
    "fr": "Cliquez pour démarrer",
};
i18nData["intro-to-play-touch"] = {
    "en": "Touch to play",
    "fr": "Pressez pour démarrer",
};
i18nData["intro-tip-keyboard"] = {
    "en": "Hold [A] and [D] or [<] and [>] to move the ball",
    "fr": "Pressez [A] et [D] ou [<] et [>] pour diriger la balle",
};
i18nData["intro-tip-touch"] = {
    "en": "Hold [<] and [>] to move the ball",
    "fr": "Pressez [<] et [>] pour diriger la balle",
};
// Success Panel
i18nData["success-title"] = {
    "en": "SUCCESS !",
    "fr": "VICTOIRE !"
};
i18nData["success-submit-score"] = {
    "en": "Submit Score",
    "fr": "Publier Score"
};
i18nData["success-sending-score"] = {
    "en": "Sending...",
    "fr": "Envoi..."
};
i18nData["success-well-played"] = {
    "en": "Well Played !",
    "fr": "Bien Joué !"
};
i18nData["success-continue"] = {
    "en": "Continue",
    "fr": "Continuer"
};
i18nData["success-next-level"] = {
    "en": "Next Level",
    "fr": "Niveau Suivant"
};
i18nData["success-expert-unlocked"] = {
    "en": "puzzle unlocked",
    "fr": "puzzle déverrouillé"
};
// Tutorial
i18nData["tuto-title"] = {
    "en": "Tutorial",
    "fr": "Instructions"
};
i18nData["tuto-0-label"] = {
    "en": "Context",
    "fr": "Contexte"
};
i18nData["tuto-0-text"] = {
    "en": "This is the Ball.",
    "fr": "Ceci est la Balle."
};
i18nData["tuto-1-label"] = {
    "en": "Rule",
    "fr": "Règle"
};
i18nData["tuto-1-text"] = {
    "en": "The Ball always moves up and down.",
    "fr": "La balle se déplace toujours verticalement."
};
i18nData["tuto-2-label"] = {
    "en": "Control",
    "fr": "Contrôle"
};
i18nData["tuto-2-text"] = {
    "en": "You can only steer the Ball Left or Right.",
    "fr": "Vous pouvez contrôler la balle horizontalement."
};
i18nData["tuto-3-label"] = {
    "en": "Objective",
    "fr": "Objectif"
};
i18nData["tuto-3-text"] = {
    "en": "Collect all the Tiles to complete the Puzzle !",
    "fr": "Collectez tous les Blocs pour terminer le Puzzle !"
};
// Puzzle Titles
i18nData["lesson-control"] = {
    "en": "Lesson - Control",
    "fr": "Leçon - Contrôle",
};
i18nData["lesson-color"] = {
    "en": "Lesson - Color",
    "fr": "Leçon - Couleur ",
};
i18nData["lesson-hole"] = {
    "en": "Lesson - Hole",
    "fr": "Leçon - Trou",
};
i18nData["lesson-push"] = {
    "en": "Lesson - Push",
    "fr": "Leçon - Pousser",
};
i18nData["lesson-door"] = {
    "en": "Lesson - The Doors",
    "fr": "Leçon - Les Portes",
};
i18nData["lesson-crack"] = {
    "en": "Lesson - Crack",
    "fr": "Leçon - Fissure",
};
i18nData["lesson-water"] = {
    "en": "Lesson - Water",
    "fr": "Leçon - Eau",
};
i18nData["lesson-spikes"] = {
    "en": "Lesson - Spikes",
    "fr": "Leçon - Piquants",
};
i18nData["lesson-gap"] = {
    "en": "Lesson - Gap",
    "fr": "Leçon - Passage",
};
i18nData["challenge-bridge"] = {
    "en": "Challenge 1 - Bridge",
    "fr": "Challenge 1 - Pont",
};
i18nData["challenge-gates"] = {
    "en": "Challenge 2 - Gates",
    "fr": "Challenge 2 - Portes",
};
// Translated Haikus
i18nData["lesson-1-haiku"] = {
    "en": "Use [A] and [D] to\nmove Left and Right.",
    "fr": "Pressez [A] et [D] pour\naller à Gauche ou à Droite.",
};
i18nData["lesson-2-haiku"] = {
    "en": "Hit a Drum to\nchange Color.",
    "fr": "Touchez un disque\npour changer de Couleur.",
};
i18nData["lesson-3-haiku"] = {
    "en": "Do not fall in a hole.",
    "fr": "Ne tombez pas dans un trou.",
};
i18nData["lesson-4-haiku"] = {
    "en": "Wooden Boxes\ncan be Pushed.",
    "fr": "Les Blocs en bois\npeuvent être Poussés.",
};
i18nData["lesson-5-haiku"] = {
    "en": "Hit a Key Tile\nto open Door Tiles.",
    "fr": "Touchez une Clef\npour ouvrir les Portes.",
};
i18nData["lesson-6-haiku"] = {
    "en": "Cracked Tiles can\nonly be crossed once.",
    "fr": "Une Dalle fendue\ncède après un passage.",
};
i18nData["lesson-7-haiku"] = {
    "en": "Water flows\nto the bottom.",
    "fr": "L'eau s'écoule\nvers le bas.",
};
i18nData["lesson-8-haiku"] = {
    "en": "Spikes are dangerous\navoid the Spikes.",
    "fr": "Attention ! Piquants !\nEvitez les Piquants.",
};
i18nData["lesson-9-haiku"] = {
    "en": "Use the Tiles to\navoid the crevass.",
    "fr": "Utilisez les blocs\npour éviter le gouffre.",
};
i18nData["challenge-bridge-haiku"] = {
    "en": "Challenge - 1\nOver the Bridge",
    "fr": "Challenge - 1\nPar le Pont",
};
i18nData["challenge-gates-haiku"] = {
    "en": "Challenge - 2\nWater & Gates",
    "fr": "Challenge - 2\nEau & Portes",
};
i18nData["play"]["pl"] = "GRAJ";
i18nData["completed"]["pl"] = "ukończone";
i18nData["home-story-mode"]["pl"] = "tryb opowieści";
i18nData["home-expert-mode"]["pl"] = "tryb eksperta";
i18nData["home-community-mode"]["pl"] = "zagadki społeczności";
i18nData["intro-to-play-keyboard"]["pl"] = "Kliknij, aby zagrać";
i18nData["intro-to-play-touch"]["pl"] = "Dotknij, aby zagrać";
i18nData["intro-tip-keyboard"]["pl"] = "Przytrzymaj [A] i [D] lub [<] i [>], aby przesunąć piłkę";
i18nData["intro-tip-touch"]["pl"] = "Przytrzymaj [<] i [>], aby przesunąć piłkę";
i18nData["success-title"]["pl"] = "SUKCES!";
i18nData["success-submit-score"]["pl"] = "Prześlij wynik";
i18nData["success-sending-score"]["pl"] = "Wysyłanie...";
i18nData["success-well-played"]["pl"] = "Dobrze zagrane!";
i18nData["success-continue"]["pl"] = "Kontynuuj";
i18nData["success-next-level"]["pl"] = "Następny poziom";
i18nData["success-expert-unlocked"]["pl"] = "zagadka odblokowana";
i18nData["tuto-title"]["pl"] = "Samouczek";
i18nData["tuto-0-label"]["pl"] = "Kontekst";
i18nData["tuto-0-text"]["pl"] = "To jest piłka.";
i18nData["tuto-1-label"]["pl"] = "Zasada";
i18nData["tuto-1-text"]["pl"] = "Piłka zawsze porusza się w górę i w dół.";
i18nData["tuto-2-label"]["pl"] = "Kontrola";
i18nData["tuto-2-text"]["pl"] = "Możesz sterować piłką tylko w lewo lub w prawo.";
i18nData["tuto-3-label"]["pl"] = "Cel";
i18nData["tuto-3-text"]["pl"] = "Zbierz wszystkie kafelki, aby ukończyć zagadkę!";
i18nData["lesson-control"]["pl"] = "Lekcja - Kontrola";
i18nData["lesson-color"]["pl"] = "Lekcja - Kolor";
i18nData["lesson-hole"]["pl"] = "Lekcja - Otwór";
i18nData["lesson-push"]["pl"] = "Lekcja - Pchnięcie";
i18nData["lesson-door"]["pl"] = "Lekcja - Drzwi";
i18nData["lesson-crack"]["pl"] = "Lekcja - Pęknięcie";
i18nData["lesson-water"]["pl"] = "Lekcja - Woda";
i18nData["lesson-spikes"]["pl"] = "Lekcja - Kolce";
i18nData["lesson-gap"]["pl"] = "Lekcja - Szczelina";
i18nData["lesson-1-haiku"]["pl"] = "Używaj [A] i [D], aby\nporuszać się w lewo i prawo.";
i18nData["lesson-2-haiku"]["pl"] = "Uderz w bęben,\naby zmienić kolor.";
i18nData["lesson-3-haiku"]["pl"] = "Nie wpadnij do dziury.";
i18nData["lesson-4-haiku"]["pl"] = "Drewniane skrzynki\nmożna pchać.";
i18nData["lesson-5-haiku"]["pl"] = "Uderz w kluczowy kafelek,\naby otworzyć kafelki drzwi.";
i18nData["lesson-6-haiku"]["pl"] = "Popękane kafelki można\nprzekroczyć tylko raz.";
i18nData["lesson-7-haiku"]["pl"] = "Woda spływa\nna dół.";
i18nData["lesson-8-haiku"]["pl"] = "Kolce są niebezpieczne,\nunikaj kolców.";
i18nData["lesson-9-haiku"]["pl"] = "Używaj kafelków,\naby uniknąć szczeliny.";
i18nData["play"]["de"] = "SPIELEN";
i18nData["completed"]["de"] = "abgeschlossen";
i18nData["home-story-mode"]["de"] = "Story-Modus";
i18nData["home-expert-mode"]["de"] = "Experten modus";
i18nData["home-community-mode"]["de"] = "Community-Rätsel";
i18nData["intro-to-play-keyboard"]["de"] = "Zum Spielen klicken";
i18nData["intro-to-play-touch"]["de"] = "Zum Spielen berühren";
i18nData["intro-tip-keyboard"]["de"] = "Halten Sie [A] und [D] oder [<] und [>] gedrückt, um den Ball zu bewegen";
i18nData["intro-tip-touch"]["de"] = "Halten Sie [<] und [>] gedrückt, um den Ball zu bewegen";
i18nData["success-title"]["de"] = "ERFOLGREICH!";
i18nData["success-submit-score"]["de"] = "Punktzahl übermitteln";
i18nData["success-sending-score"]["de"] = "Senden...";
i18nData["success-well-played"]["de"] = "Gut gespielt!";
i18nData["success-continue"]["de"] = "Weiter";
i18nData["success-next-level"]["de"] = "Nächstes Level";
i18nData["success-expert-unlocked"]["de"] = "Rätsel freigeschaltet";
i18nData["tuto-title"]["de"] = "Tutorial";
i18nData["tuto-0-label"]["de"] = "Kontext";
i18nData["tuto-0-text"]["de"] = "Das ist der Ball.";
i18nData["tuto-1-label"]["de"] = "Regel";
i18nData["tuto-1-text"]["de"] = "Der Ball bewegt sich immer auf und ab.";
i18nData["tuto-2-label"]["de"] = "Steuerung";
i18nData["tuto-2-text"]["de"] = "Sie können den Ball nur nach links oder rechts lenken.";
i18nData["tuto-3-label"]["de"] = "Ziel";
i18nData["tuto-3-text"]["de"] = "Sammeln Sie alle Kacheln, um das Rätsel zu lösen!";
i18nData["lesson-control"]["de"] = "Lektion - Steuerung";
i18nData["lesson-color"]["de"] = "Lektion - Farbe";
i18nData["lesson-hole"]["de"] = "Lektion - Loch";
i18nData["lesson-push"]["de"] = "Lektion - Stoßen";
i18nData["lesson-door"]["de"] = "Lektion - Die Türen";
i18nData["lesson-crack"]["de"] = "Lektion - Riss";
i18nData["lesson-water"]["de"] = "Lektion - Wasser";
i18nData["lesson-spikes"]["de"] = "Lektion - Stacheln";
i18nData["lesson-gap"]["de"] = "Lektion - Lücke";
i18nData["lesson-1-haiku"]["de"] = "Verwenden Sie [A] und [D],\num sich nach links\nund rechts zu bewegen.";
i18nData["lesson-2-haiku"]["de"] = "Schlagen Sie auf eine Trommel,\num die Farbe zu ändern.";
i18nData["lesson-3-haiku"]["de"] = "Fallen Sie nicht in ein Loch.";
i18nData["lesson-4-haiku"]["de"] = "Holzkisten können geschoben werden.";
i18nData["lesson-5-haiku"]["de"] = "Schlagen Sie auf eine\nSchlüsselkachel, um Türkacheln\nzu öffnen.";
i18nData["lesson-6-haiku"]["de"] = "Gesprungene Kacheln können\nnur einmal überquert werden.";
i18nData["lesson-7-haiku"]["de"] = "Wasser fließt nach unten.";
i18nData["lesson-8-haiku"]["de"] = "Spikes sind gefährlich,\nvermeiden Sie die Spikes.";
i18nData["lesson-9-haiku"]["de"] = "Verwenden Sie die Kacheln,\num der Gletscherspalte auszuweichen.";
i18nData["play"]["pt"] = "JOGAR";
i18nData["completed"]["pt"] = "concluído";
i18nData["home-story-mode"]["pt"] = "modo história";
i18nData["home-expert-mode"]["pt"] = "modo especialista";
i18nData["home-community-mode"]["pt"] = "quebra-cabeças da comunidade";
i18nData["intro-to-play-keyboard"]["pt"] = "Clique para jogar";
i18nData["intro-to-play-touch"]["pt"] = "Toque para jogar";
i18nData["intro-tip-keyboard"]["pt"] = "Segure [A] e [D] ou [<] e [>] para mover a bola";
i18nData["intro-tip-touch"]["pt"] = "Segure [<] e [>] para mover a bola";
i18nData["success-title"]["pt"] = "SUCESSO!";
i18nData["success-submit-score"]["pt"] = "Enviar pontuação";
i18nData["success-sending-score"]["pt"] = "Enviando...";
i18nData["success-well-played"]["pt"] = "Bem jogado!";
i18nData["success-continue"]["pt"] = "Continuar";
i18nData["success-next-level"]["pt"] = "Próximo nível";
i18nData["success-expert-unlocked"]["pt"] = "quebra-cabeça desbloqueado";
i18nData["tuto-title"]["pt"] = "Tutorial";
i18nData["tuto-0-label"]["pt"] = "Contexto";
i18nData["tuto-0-text"]["pt"] = "Esta é a bola.";
i18nData["tuto-1-label"]["pt"] = "Regra";
i18nData["tuto-1-text"]["pt"] = "A bola sempre se move para cima e para baixo.";
i18nData["tuto-2-label"]["pt"] = "Controle";
i18nData["tuto-2-text"]["pt"] = "Você só pode dirigir a bola para a esquerda ou direita.";
i18nData["tuto-3-label"]["pt"] = "Objetivo";
i18nData["tuto-3-text"]["pt"] = "Colete todas as peças para completar o quebra-cabeça!";
i18nData["lesson-control"]["pt"] = "Lição - Controle";
i18nData["lesson-color"]["pt"] = "Lição - Cor";
i18nData["lesson-hole"]["pt"] = "Lição - Buraco";
i18nData["lesson-push"]["pt"] = "Lição - Empurrar";
i18nData["lesson-door"]["pt"] = "Lição - As portas";
i18nData["lesson-crack"]["pt"] = "Lição - Rachadura";
i18nData["lesson-water"]["pt"] = "Lição - Água";
i18nData["lesson-spikes"]["pt"] = "Lição - Picos";
i18nData["lesson-gap"]["pt"] = "Lição - Lacuna";
i18nData["lesson-1-haiku"]["pt"] = "Use [A] e [D] para mover\npara a esquerda e direita.";
i18nData["lesson-2-haiku"]["pt"] = "Bata em um tambor\npara mudar de cor.";
i18nData["lesson-3-haiku"]["pt"] = "Não caia em um buraco.";
i18nData["lesson-4-haiku"]["pt"] = "Caixas de madeira\npodem ser empurradas.";
i18nData["lesson-5-haiku"]["pt"] = "Bata em uma Key Tile\npara abrir Door Tiles.";
i18nData["lesson-6-haiku"]["pt"] = "Tiles rachadas só podem\nser cruzadas uma vez.";
i18nData["lesson-7-haiku"]["pt"] = "A água flui\npara o fundo.";
i18nData["lesson-8-haiku"]["pt"] = "Spikes são perigosos,\nevite os Spikes.";
i18nData["lesson-9-haiku"]["pt"] = "Use os Tiles\npara evitar a fenda.";
i18nData["play"]["it"] = "GIOCA";
i18nData["completed"]["it"] = "completato";
i18nData["home-story-mode"]["it"] = "modalità storia";
i18nData["home-expert-mode"]["it"] = "modalità esperto";
i18nData["home-community-mode"]["it"] = "puzzle della comunità";
i18nData["intro-to-play-keyboard"]["it"] = "Clicca per giocare";
i18nData["intro-to-play-touch"]["it"] = "Tocca per giocare";
i18nData["intro-tip-keyboard"]["it"] = "Tieni premuti [A] e [D] o [<] e [>] per muovere la palla";
i18nData["intro-tip-touch"]["it"] = "Tieni premuti [<] e [>] per muovere la palla";
i18nData["success-title"]["it"] = "SUCCESSO !";
i18nData["success-submit-score"]["it"] = "Invia punteggio";
i18nData["success-sending-score"]["it"] = "Invio in corso...";
i18nData["success-well-played"]["it"] = "Ben giocato !";
i18nData["success-continue"]["it"] = "Continua";
i18nData["success-next-level"]["it"] = "Livello successivo";
i18nData["success-expert-unlocked"]["it"] = "puzzle sbloccato";
i18nData["tuto-title"]["it"] = "Tutorial";
i18nData["tuto-0-label"]["it"] = "Contesto";
i18nData["tuto-0-text"]["it"] = "Questa è la palla.";
i18nData["tuto-1-label"]["it"] = "Regola";
i18nData["tuto-1-text"]["it"] = "La palla si muove sempre su e giù.";
i18nData["tuto-2-label"]["it"] = "Controllo";
i18nData["tuto-2-text"]["it"] = "Puoi solo guidare la palla a sinistra o a destra.";
i18nData["tuto-3-label"]["it"] = "Obiettivo";
i18nData["tuto-3-text"]["it"] = "Raccogli tutte le tessere per completare il puzzle!";
i18nData["lesson-control"]["it"] = "Lezione - Controllo";
i18nData["lesson-color"]["it"] = "Lezione - Colore";
i18nData["lesson-hole"]["it"] = "Lezione - Buco";
i18nData["lesson-push"]["it"] = "Lezione - Spingi";
i18nData["lesson-door"]["it"] = "Lezione - Le porte";
i18nData["lesson-crack"]["it"] = "Lezione - Crepa";
i18nData["lesson-water"]["it"] = "Lezione - Acqua";
i18nData["lesson-spikes"]["it"] = "Lezione - Punte";
i18nData["lesson-gap"]["it"] = "Lezione - Spazio";
i18nData["lesson-1-haiku"]["it"] = "Usa [A] e [D] per muoverti\na sinistra e a destra.";
i18nData["lesson-2-haiku"]["it"] = "Colpisci un tamburo\nper cambiare colore.";
i18nData["lesson-3-haiku"]["it"] = "Non cadere in un buco.";
i18nData["lesson-4-haiku"]["it"] = "Le scatole di legno\npossono essere spinte.";
i18nData["lesson-5-haiku"]["it"] = "Colpisci una tessera chiave\nper aprire le tessere porta.";
i18nData["lesson-6-haiku"]["it"] = "Le tessere incrinate possono\nessere attraversate solo una volta.";
i18nData["lesson-7-haiku"]["it"] = "L'acqua scorre\nverso il basso.";
i18nData["lesson-8-haiku"]["it"] = "Le punte sono pericolose,\nevita le punte.";
i18nData["lesson-9-haiku"]["it"] = "Usa le tessere per\nevitare il crepaccio.";
i18nData["play"]["es"] = "JUGAR";
i18nData["completed"]["es"] = "completado";
i18nData["home-story-mode"]["es"] = "modo historia";
i18nData["home-expert-mode"]["es"] = "modo experto";
i18nData["home-community-mode"]["es"] = "rompecabezas de la comunidad";
i18nData["intro-to-play-keyboard"]["es"] = "Haz clic para jugar";
i18nData["intro-to-play-touch"]["es"] = "Toca para jugar";
i18nData["intro-tip-keyboard"]["es"] = "Mantén presionados [A] y [D] o [<] y [>] para mover la pelota";
i18nData["intro-tip-touch"]["es"] = "Mantén presionados [<] y [>] para mover la pelota";
i18nData["success-title"]["es"] = "¡ÉXITO!";
i18nData["success-submit-score"]["es"] = "Enviar puntaje";
i18nData["success-sending-score"]["es"] = "Enviando...";
i18nData["success-well-played"]["es"] = "¡Bien jugado!";
i18nData["success-continue"]["es"] = "Continuar";
i18nData["success-next-level"]["es"] = "Siguiente nivel";
i18nData["success-expert-unlocked"]["es"] = "rompecabezas desbloqueado";
i18nData["tuto-title"]["es"] = "Tutorial";
i18nData["tuto-0-label"]["es"] = "Contexto";
i18nData["tuto-0-text"]["es"] = "Esta es la pelota.";
i18nData["tuto-1-label"]["es"] = "Regla";
i18nData["tuto-1-text"]["es"] = "La pelota siempre se mueve hacia arriba y hacia abajo.";
i18nData["tuto-2-label"]["es"] = "Control";
i18nData["tuto-2-text"]["es"] = "Solo puedes dirigir la pelota hacia la izquierda o la derecha.";
i18nData["tuto-3-label"]["es"] = "Objetivo";
i18nData["tuto-3-text"]["es"] = "¡Reúne todas las fichas para completar el rompecabezas!";
i18nData["lesson-control"]["es"] = "Lección - Control";
i18nData["lesson-color"]["es"] = "Lección - Color";
i18nData["lesson-hole"]["es"] = "Lección - Agujero";
i18nData["lesson-push"]["es"] = "Lección - Empujar";
i18nData["lesson-door"]["es"] = "Lección - Las puertas";
i18nData["lesson-crack"]["es"] = "Lección - Grieta";
i18nData["lesson-water"]["es"] = "Lección - Agua";
i18nData["lesson-spikes"]["es"] = "Lección - Púas";
i18nData["lesson-gap"]["es"] = "Lección - Hueco";
i18nData["lesson-1-haiku"]["es"] = "Usa [A] y [D] para moverte\nhacia la izquierda y la derecha.";
i18nData["lesson-2-haiku"]["es"] = "Golpea un tambor\npara cambiar de color.";
i18nData["lesson-3-haiku"]["es"] = "No caigas en un agujero.";
i18nData["lesson-4-haiku"]["es"] = "Las cajas de madera\nse pueden empujar.";
i18nData["lesson-5-haiku"]["es"] = "Golpea una llave\npara abrir las puertas.";
i18nData["lesson-6-haiku"]["es"] = "Las fichas agrietadas\nsolo se pueden cruzar una vez.";
i18nData["lesson-7-haiku"]["es"] = "El agua fluye\nhacia el fondo.";
i18nData["lesson-8-haiku"]["es"] = "Los pinchos son peligrosos,\nevítalos.";
i18nData["lesson-9-haiku"]["es"] = "Usa las fichas\npara evitar la grieta.";
i18nData["play"]["nl"] = "SPELEN";
i18nData["completed"]["nl"] = "voltooid";
i18nData["home-story-mode"]["nl"] = "verhaalmodus";
i18nData["home-expert-mode"]["nl"] = "expertmodus";
i18nData["home-community-mode"]["nl"] = "communitypuzzels";
i18nData["intro-to-play-keyboard"]["nl"] = "Klik om te spelen";
i18nData["intro-to-play-touch"]["nl"] = "Aanraken om te spelen";
i18nData["intro-tip-keyboard"]["nl"] = "Houd [A] en [D] of [<] en [>] ingedrukt om de bal te verplaatsen";
i18nData["intro-tip-touch"]["nl"] = "Houd [<] en [>] ingedrukt om de bal te verplaatsen";
i18nData["success-title"]["nl"] = "SUCCES!";
i18nData["success-submit-score"]["nl"] = "Score indienen";
i18nData["success-sending-score"]["nl"] = "Verzenden...";
i18nData["success-well-played"]["nl"] = "Goed gespeeld!";
i18nData["success-continue"]["nl"] = "Doorgaan";
i18nData["success-next-level"]["nl"] = "Volgend niveau";
i18nData["success-expert-unlocked"]["nl"] = "puzzel ontgrendeld";
i18nData["tuto-title"]["nl"] = "Tutorial";
i18nData["tuto-0-label"]["nl"] = "Context";
i18nData["tuto-0-text"]["nl"] = "Dit is de bal.";
i18nData["tuto-1-label"]["nl"] = "Regel";
i18nData["tuto-1-text"]["nl"] = "De bal beweegt altijd omhoog en omlaag.";
i18nData["tuto-2-label"]["nl"] = "Besturing";
i18nData["tuto-2-text"]["nl"] = "Je kunt de bal alleen naar links of rechts sturen.";
i18nData["tuto-3-label"]["nl"] = "Doel";
i18nData["tuto-3-text"]["nl"] = "Verzamel alle tegels om de puzzel te voltooien!";
i18nData["lesson-control"]["nl"] = "Les - Besturing";
i18nData["lesson-color"]["nl"] = "Les - Kleur";
i18nData["lesson-hole"]["nl"] = "Les - Gat";
i18nData["lesson-push"]["nl"] = "Les - Duwen";
i18nData["lesson-door"]["nl"] = "Les - De deuren";
i18nData["lesson-crack"]["nl"] = "Les - Barst";
i18nData["lesson-water"]["nl"] = "Les - Water";
i18nData["lesson-spikes"]["nl"] = "Les - Spikes";
i18nData["lesson-gap"]["nl"] = "Les - Gap";
i18nData["lesson-1-haiku"]["nl"] = "Gebruik [A] en [D] om naar\nlinks en rechts te bewegen.";
i18nData["lesson-2-haiku"]["nl"] = "Sla op een trommel om\nvan kleur te veranderen.";
i18nData["lesson-3-haiku"]["nl"] = "Val niet in een gat.";
i18nData["lesson-4-haiku"]["nl"] = "Houten kisten kunnen\nworden geduwd.";
i18nData["lesson-5-haiku"]["nl"] = "Sla op een sleuteltegel\nom deurtegels te openen.";
i18nData["lesson-6-haiku"]["nl"] = "Gebarsten tegels kunnen maar\néén keer worden overgestoken.";
i18nData["lesson-7-haiku"]["nl"] = "Water stroomt\nnaar de bodem.";
i18nData["lesson-8-haiku"]["nl"] = "Spikes zijn gevaarlijk,\nvermijd de spikes.";
i18nData["lesson-9-haiku"]["nl"] = "Gebruik de tegels om\nde spleet te vermijden.";
let fullEnglishText = "";
for (const key in i18nData) {
    fullEnglishText += i18nData[key]["en"].replaceAll("\n", " ") + "\n";
}
function AddTranslation(locale, text) {
    let lines = text.split("\n");
    let n = 0;
    let output = "";
    for (const key in i18nData) {
        output += "i18nData[\"" + key + "\"][\"" + locale + "\"] = \"" + lines[n] + "\";\n";
        n++;
    }
    console.log(output);
}
function CenterPanel(panel, dx = 0, dy = 0) {
    let bodyRect = document.body.getBoundingClientRect();
    let panelRect = panel.getBoundingClientRect();
    if (bodyRect.width * 0.95 < panelRect.width) {
        let f = bodyRect.width / panelRect.width * 0.95;
        panel.style.transformOrigin = "top left";
        panel.style.transform = "scale(" + f.toFixed(3) + ", " + f.toFixed(3) + ")";
        panel.style.left = "2.5%";
        panel.style.right = "auto";
    }
    else {
        let left = Math.floor((bodyRect.width - panelRect.width) * 0.5 + dx / window.devicePixelRatio);
        panel.style.left = left.toFixed(0) + "px";
        panel.style.right = "auto";
    }
    if (bodyRect.height * 0.95 < panelRect.height) {
        let f = bodyRect.height / panelRect.height * 0.95;
        panel.style.transformOrigin = "top left";
        panel.style.transform = "scale(" + f.toFixed(3) + ", " + f.toFixed(3) + ")";
        panel.style.top = "2.5%";
        panel.style.bottom = "auto";
    }
    else {
        let top = Math.floor((bodyRect.height - panelRect.height) * 0.5 + dy / window.devicePixelRatio);
        panel.style.top = top.toFixed(0) + "px";
        panel.style.bottom = "auto";
    }
}
