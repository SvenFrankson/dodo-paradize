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
class ColorPicker extends HTMLElement {
    constructor() {
        super(...arguments);
        this.targetIndex = -1;
        this.buttons = [];
        this._loaded = false;
        this._shown = false;
        this.onColorIndexChanged = (colorIndex) => { };
    }
    static get observedAttributes() {
        return [];
    }
    get loaded() {
        return this._loaded;
    }
    get shown() {
        return this._shown;
    }
    get onLoad() {
        return this._onLoad;
    }
    set onLoad(callback) {
        this._onLoad = callback;
        if (this._loaded) {
            this._onLoad();
        }
    }
    async waitLoaded() {
        return new Promise(resolve => {
            let wait = () => {
                if (this._loaded) {
                    resolve();
                }
                else {
                    requestAnimationFrame(wait);
                }
            };
            wait();
        });
    }
    connectedCallback() {
        this.style.display = "none";
        this.addEventListener("pointerdown", StopPointerProgatation);
        this.addEventListener("pointermove", StopPointerProgatation);
        this.addEventListener("pointerup", StopPointerProgatationAndMonkeys);
        let container;
        container = document.createElement("div");
        container.classList.add("container");
        this.appendChild(container);
        this.titleElement = document.createElement("h2");
        this.titleElement.innerHTML = "Color";
        container.appendChild(this.titleElement);
        this.metalMaterialButtons = document.createElement("div");
        container.appendChild(this.metalMaterialButtons);
        this.exterior = document.createElement("div");
        this.exterior.classList.add("color-picker-exterior");
        this.exterior.style.display = "none";
        this.parentElement.appendChild(this.exterior);
        this.exterior.onclick = () => {
            this.hide();
        };
        this._loaded = true;
    }
    initColorButtons(game) {
        this.buttons = [];
        for (let i = 0; i < DodoColors.length; i++) {
            let index = i;
            let dodoColor = DodoColors[i];
            let colorbutton = document.createElement("button");
            colorbutton.setAttribute("title", dodoColor.name);
            colorbutton.style.backgroundColor = dodoColor.hex;
            this.metalMaterialButtons.appendChild(colorbutton);
            this.buttons[index] = colorbutton;
            colorbutton.onclick = () => {
                this.setCurrentColorIndex(index);
                if (this.onColorIndexChanged) {
                    this.onColorIndexChanged(index);
                }
            };
        }
    }
    setCurrentColorIndex(colorIndex) {
        this.buttons.forEach(btn => {
            btn.classList.remove("selected");
        });
        if (this.buttons[colorIndex]) {
            this.buttons[colorIndex].classList.add("selected");
        }
    }
    attributeChangedCallback(name, oldValue, newValue) { }
    setAnchor(x, y) {
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (document.body.classList.contains("vertical")) {
            this.style.right = x.toFixed(0) + "px";
            this.style.bottom = y.toFixed(0) + "px";
            this.style.top = "";
        }
        else {
            console.log(w + " " + h + " " + x + " " + y);
            if (x > w * 0.5) {
                this.style.right = (w - x).toFixed(0) + "px";
                this.style.left = "";
            }
            else {
                this.style.right = "";
                this.style.left = x.toFixed(0) + "px";
            }
            if (y > h * 0.5) {
                this.style.bottom = (h - y).toFixed(0) + "px";
                this.style.top = "";
            }
            else {
                this.style.bottom = "";
                this.style.top = y.toFixed(0) + "px";
            }
        }
    }
    async show() {
        this._shown = true;
        this.style.display = "block";
        this.exterior.style.display = "block";
    }
    async hide() {
        this._shown = false;
        this.style.display = "none";
        this.exterior.style.display = "none";
        this.onColorIndexChanged = undefined;
    }
}
customElements.define("color-picker", ColorPicker);
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
var BRICKS_PER_CONSTRUCTION = 32;
var ONE_cm_SQUARED = 0.01 * 0.01;
var ONE_mm_SQUARED = 0.01 * 0.01;
class DevMode {
    constructor(game) {
        this.game = game;
        this.activated = false;
    }
    getPassword() {
        return "Crillion";
    }
    initialize() {
        if (location.host.startsWith("127.0.0.1")) {
            //this.activated = true;
        }
    }
}
var KeyInput;
(function (KeyInput) {
    KeyInput[KeyInput["NULL"] = -1] = "NULL";
    KeyInput[KeyInput["ACTION_SLOT_0"] = 0] = "ACTION_SLOT_0";
    KeyInput[KeyInput["ACTION_SLOT_1"] = 1] = "ACTION_SLOT_1";
    KeyInput[KeyInput["ACTION_SLOT_2"] = 2] = "ACTION_SLOT_2";
    KeyInput[KeyInput["ACTION_SLOT_3"] = 3] = "ACTION_SLOT_3";
    KeyInput[KeyInput["ACTION_SLOT_4"] = 4] = "ACTION_SLOT_4";
    KeyInput[KeyInput["ACTION_SLOT_5"] = 5] = "ACTION_SLOT_5";
    KeyInput[KeyInput["ACTION_SLOT_6"] = 6] = "ACTION_SLOT_6";
    KeyInput[KeyInput["ACTION_SLOT_7"] = 7] = "ACTION_SLOT_7";
    KeyInput[KeyInput["ACTION_SLOT_8"] = 8] = "ACTION_SLOT_8";
    KeyInput[KeyInput["ACTION_SLOT_9"] = 9] = "ACTION_SLOT_9";
    KeyInput[KeyInput["PLAYER_ACTION"] = 10] = "PLAYER_ACTION";
    KeyInput[KeyInput["PLAYER_ACTION_EQUIP"] = 11] = "PLAYER_ACTION_EQUIP";
    KeyInput[KeyInput["PLAYER_ACTION_INC"] = 12] = "PLAYER_ACTION_INC";
    KeyInput[KeyInput["PLAYER_ACTION_DEC"] = 13] = "PLAYER_ACTION_DEC";
    KeyInput[KeyInput["INVENTORY"] = 14] = "INVENTORY";
    KeyInput[KeyInput["INVENTORY_PREV_CAT"] = 15] = "INVENTORY_PREV_CAT";
    KeyInput[KeyInput["INVENTORY_NEXT_CAT"] = 16] = "INVENTORY_NEXT_CAT";
    KeyInput[KeyInput["INVENTORY_EQUIP_ITEM"] = 17] = "INVENTORY_EQUIP_ITEM";
    KeyInput[KeyInput["NEXT_SHAPE"] = 18] = "NEXT_SHAPE";
    KeyInput[KeyInput["ROTATE_SELECTED"] = 19] = "ROTATE_SELECTED";
    KeyInput[KeyInput["DELETE_SELECTED"] = 20] = "DELETE_SELECTED";
    KeyInput[KeyInput["MOVE_FORWARD"] = 21] = "MOVE_FORWARD";
    KeyInput[KeyInput["MOVE_LEFT"] = 22] = "MOVE_LEFT";
    KeyInput[KeyInput["MOVE_BACK"] = 23] = "MOVE_BACK";
    KeyInput[KeyInput["MOVE_RIGHT"] = 24] = "MOVE_RIGHT";
    KeyInput[KeyInput["JUMP"] = 25] = "JUMP";
    KeyInput[KeyInput["MAIN_MENU"] = 26] = "MAIN_MENU";
    KeyInput[KeyInput["WORKBENCH"] = 27] = "WORKBENCH";
})(KeyInput || (KeyInput = {}));
class GameConfiguration extends Nabu.Configuration {
    constructor(configName, game) {
        super(configName);
        this.game = game;
    }
    _buildElementsArray() {
        this.configurationElements = [
            new Nabu.ConfigurationElement("quality", Nabu.ConfigurationElementType.Enum, 0, Nabu.ConfigurationElementCategory.Graphic, {
                displayName: "Graphic Quality",
                min: 0,
                max: 2,
                toString: (v) => {
                    if (v === 0) {
                        return "LOW";
                    }
                    if (v === 1) {
                        return "MEDIUM";
                    }
                    if (v === 2) {
                        return "HIGH";
                    }
                }
            }),
            new Nabu.ConfigurationElement("canLockPointer", Nabu.ConfigurationElementType.Boolean, 1, Nabu.ConfigurationElementCategory.Control, {
                displayName: "Can Lock Pointer"
            }),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "PLAYER_ACTION", KeyInput.PLAYER_ACTION, "GamepadBtn0"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "PLAYER_ACTION_DEC", KeyInput.PLAYER_ACTION_DEC, "GamepadBtn12"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "PLAYER_ACTION_INC", KeyInput.PLAYER_ACTION_INC, "GamepadBtn13"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "INVENTORY.0", KeyInput.INVENTORY, "GamepadBtn2"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "INVENTORY.1", KeyInput.INVENTORY, "KeyI"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "INVENTORY_PREV_CAT", KeyInput.INVENTORY_PREV_CAT, "GamepadBtn4"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "INVENTORY_NEXT_CAT", KeyInput.INVENTORY_NEXT_CAT, "GamepadBtn5"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "INVENTORY_EQUIP_ITEM", KeyInput.INVENTORY_EQUIP_ITEM, "GamepadBtn0"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "NEXT_SHAPE", KeyInput.NEXT_SHAPE, "KeyZ"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ROTATE_SELECTED", KeyInput.ROTATE_SELECTED, "KeyR"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "DELETE_SELECTED", KeyInput.DELETE_SELECTED, "KeyX"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "MOVE_FORWARD", KeyInput.MOVE_FORWARD, "KeyW"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "MOVE_LEFT", KeyInput.MOVE_LEFT, "KeyA"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "MOVE_BACK", KeyInput.MOVE_BACK, "KeyS"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "MOVE_RIGHT", KeyInput.MOVE_RIGHT, "KeyD"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "JUMP", KeyInput.JUMP, "Space"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_0", KeyInput.ACTION_SLOT_0, "Digit0"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_1", KeyInput.ACTION_SLOT_1, "Digit1"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_2", KeyInput.ACTION_SLOT_2, "Digit2"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_3", KeyInput.ACTION_SLOT_3, "Digit3"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_4", KeyInput.ACTION_SLOT_4, "Digit4"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_5", KeyInput.ACTION_SLOT_5, "Digit5"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_6", KeyInput.ACTION_SLOT_6, "Digit6"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_7", KeyInput.ACTION_SLOT_7, "Digit7"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_8", KeyInput.ACTION_SLOT_8, "Digit8"),
            Nabu.ConfigurationElement.SimpleInput(this.game.inputManager, "ACTION_SLOT_9", KeyInput.ACTION_SLOT_9, "Digit9")
        ];
    }
    getValue(property) {
        let configElement = this.configurationElements.find(e => { return e.property === property; });
        if (configElement) {
            return configElement.value;
        }
    }
}
class HomeMenuCustomizeLine {
    constructor(line) {
        this.line = line;
        this.maxValue = 16;
        this._value = 0;
        this.onPrev = () => {
            this.setValue(this.value - 1);
        };
        this.onNext = () => {
            this.setValue(this.value + 1);
        };
        this.toString = (v) => {
            return v.toFixed(0);
        };
        this.onValueChanged = (v) => {
        };
        this.prev = this.line.querySelector(".prev");
        this.prev.onclick = this.onPrev;
        this.next = this.line.querySelector(".next");
        this.next.onclick = this.onNext;
        this.valueElement = this.line.querySelector(".value");
    }
    get value() {
        return this._value;
    }
    setValue(v, skipOnValueChangedCallback) {
        this._value = (v + this.maxValue) % this.maxValue;
        this.valueElement.innerHTML = this.toString(this.value);
        if (!skipOnValueChangedCallback) {
            this.onValueChanged(this.value);
        }
    }
}
class HomeMenuCustomizeColorLine {
    constructor(index, line, homeMenuPlate) {
        this.index = index;
        this.line = line;
        this.homeMenuPlate = homeMenuPlate;
        this.maxValue = 16;
        this._value = 0;
        this.onPrev = () => {
            this.setValue(this.value - 1);
        };
        this.onNext = () => {
            this.setValue(this.value + 1);
        };
        this.toString = (v) => {
            return v.toFixed(0);
        };
        this.onValueChanged = (v) => {
        };
        this.prev = this.line.querySelector(".prev");
        this.prev.onclick = this.onPrev;
        this.next = this.line.querySelector(".next");
        this.next.onclick = this.onNext;
        this.valueElement = this.line.querySelector(".value");
        this.valueElement.onclick = (ev) => {
            if (this.homeMenuPlate.game.colorPicker.shown &&
                this.homeMenuPlate.game.colorPicker.targetIndex === this.index) {
                this.homeMenuPlate.game.colorPicker.hide();
            }
            else {
                //let bbox = this.line.getBoundingClientRect();
                //this.homeMenuPlate.game.colorPicker.setAnchor(bbox.right + 10, ev.clientY);
                this.homeMenuPlate.game.colorPicker.setCurrentColorIndex(this.value);
                this.homeMenuPlate.game.colorPicker.onColorIndexChanged = async (colorIndex) => {
                    this.setValue(colorIndex);
                    this.homeMenuPlate.game.colorPicker.titleElement.innerHTML = this.line.querySelector(".label").innerHTML + " - " + this.toString(this.value);
                };
                this.homeMenuPlate.game.colorPicker.show();
                this.homeMenuPlate.game.colorPicker.titleElement.innerHTML = this.line.querySelector(".label").innerHTML + " - " + this.toString(this.value);
                this.homeMenuPlate.game.colorPicker.targetIndex = this.index;
            }
        };
    }
    get value() {
        return this._value;
    }
    setValue(v, skipOnValueChangedCallback) {
        this._value = (v + this.maxValue) % this.maxValue;
        if (IsVertical) {
            this.valueElement.innerHTML = "";
        }
        else {
            this.valueElement.innerHTML = this.toString(this.value);
        }
        this.valueElement.style.backgroundColor = DodoColors[this.value].hex;
        this.valueElement.style.color = DodoColors[this.value].textColor;
        if (!skipOnValueChangedCallback) {
            this.onValueChanged(this.value);
        }
    }
}
class HomeMenuPlate extends BABYLON.Mesh {
    constructor(game) {
        super("home-menu-plate");
        this.game = game;
        BABYLON.CreateCylinderVertexData({ height: 0.1, diameter: 1 }).applyToMesh(this);
        this.position.copyFromFloats(0, -1000, 0);
        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100 }, this.game.scene);
        skybox.parent = this;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.game.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture("./datas/skyboxes/cloud", this.game.scene, ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        skybox.material = skyboxMaterial;
        this.customizeHeadLine = new HomeMenuCustomizeColorLine(0, document.querySelector("#dodo-customize-head"), this);
        this.customizeHeadLine.maxValue = DodoColors.length;
        this.customizeHeadLine.toString = (v) => {
            return DodoColors[v].name;
        };
        this.customizeEyesLine = new HomeMenuCustomizeColorLine(1, document.querySelector("#dodo-customize-eyes"), this);
        this.customizeEyesLine.maxValue = DodoColors.length;
        this.customizeEyesLine.toString = (v) => {
            return DodoColors[v].name;
        };
        this.customizeBeakLine = new HomeMenuCustomizeColorLine(2, document.querySelector("#dodo-customize-beak"), this);
        this.customizeBeakLine.maxValue = DodoColors.length;
        this.customizeBeakLine.toString = (v) => {
            return DodoColors[v].name;
        };
        this.customizeBodyLine = new HomeMenuCustomizeColorLine(3, document.querySelector("#dodo-customize-body"), this);
        this.customizeBodyLine.maxValue = DodoColors.length;
        this.customizeBodyLine.toString = (v) => {
            return DodoColors[v].name;
        };
        this.customizeHatLine = new HomeMenuCustomizeLine(document.querySelector("#dodo-customize-hat"));
        this.customizeHatLine.maxValue = 3;
        var customizeHatLineLabels = ["None", "Top Hat", "Cap"];
        this.customizeHatLine.toString = (v) => {
            return customizeHatLineLabels[v];
        };
        this.customizeHatColorLine = new HomeMenuCustomizeColorLine(3, document.querySelector("#dodo-customize-hat-color"), this);
        this.customizeHatColorLine.maxValue = DodoColors.length;
        this.customizeHatColorLine.toString = (v) => {
            return DodoColors[v].name;
        };
    }
    get playerDodo() {
        return this.game.playerDodo;
    }
    initialize() {
        this.customizeHeadLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.Color1));
        this.customizeEyesLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.EyeColor));
        this.customizeBeakLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.Color2));
        this.customizeBodyLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.Color0));
        this.customizeHatLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.HatIndex));
        this.customizeHatColorLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.HatColor));
        this.customizeHeadLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.Color1);
        };
        this.customizeEyesLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.EyeColor);
        };
        this.customizeBeakLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.Color2);
        };
        this.customizeBodyLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.Color0);
        };
        this.customizeHatLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.HatIndex);
        };
        this.customizeHatColorLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.HatColor);
        };
    }
}
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
var IsVertical = false;
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
var SHARE_SERVICE_PATH = "https://dodopolis.tiaratum.com/index.php/";
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
    if (IsMobile === 1) {
        Game.Instance.playerDodo.name = "MobileBoy";
    }
    else {
        Game.Instance.playerDodo.name = "PCBoy";
    }
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
var GameMode;
(function (GameMode) {
    GameMode[GameMode["Home"] = 0] = "Home";
    GameMode[GameMode["Playing"] = 1] = "Playing";
})(GameMode || (GameMode = {}));
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = true;
        this.DEBUG_USE_LOCAL_STORAGE = true;
        this.gameMode = GameMode.Home;
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
        this.savePlayerCooldown = 2;
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
    getScene() {
        return this.scene;
    }
    async createScene() {
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
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture("./datas/skyboxes/cloud", this.scene, ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        this.skybox.material = skyboxMaterial;
        this.camera = new PlayerCamera(this);
        OutlinePostProcess.AddOutlinePostProcess(this.camera);
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
        this.defaultToonMaterial = new ToonMaterial("default-toon-material", this.scene);
        this.defaultToonMaterial.setUseVertexColor(true);
        this.defaultToonMaterial.setDiffuseSharpness(-1);
        this.defaultToonMaterial.setDiffuseCount(2);
        this.networkManager = new NetworkManager(this);
        this.colorPicker = document.querySelector("color-picker");
        this.colorPicker.initColorButtons(this);
        this.brickMenuView = document.querySelector("brick-menu");
        this.playerInventoryView = document.querySelector("inventory-page");
        this.playerActionView = new PlayerActionView();
        this.homeMenuPlate = new HomeMenuPlate(this);
        this.terrain = new Terrain(this);
        this.terrainManager = new TerrainManager(this.terrain);
        this.npcManager = new NPCManager(this);
        this.npcManager.initialize();
        this.playerDodo = new Dodo("", "Player", this, { speed: 3, stepDuration: 0.25 });
        this.playerDodo.brain = new Brain(this.playerDodo, BrainMode.Player);
        this.playerDodo.brain.initialize();
        this.playerBrain = this.playerDodo.brain;
        this.playerBrainPlayer = this.playerBrain.subBrains[BrainMode.Player];
        let playerBrain = this.playerDodo.brain.subBrains[BrainMode.Player];
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
        this.homeMenuPlate.initialize();
        document.querySelector("#start").addEventListener("click", () => {
            this.setGameMode(GameMode.Playing);
        });
        //let brick = new Brick(this.brickManager, Brick.BrickIdToIndex("brick_4x1"), 0);
        //brick.position.copyFromFloats(0, TILE_H, 0);
        //brick.updateMesh();
        this.gameLoaded = true;
        LoadPlayerFromLocalStorage(this);
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
    async setGameMode(mode) {
        this.gameMode = mode;
        if (this.gameMode === GameMode.Home) {
            this.inputManager.temporaryNoPointerLock = true;
            document.querySelector("#ingame-ui").style.display = "none";
            document.querySelector("#home-page").style.display = "block";
            this.playerDodo.unfold();
            this.playerDodo.setWorldPosition(new BABYLON.Vector3(0, -1000, 0));
            this.playerDodo.r = -4 * Math.PI / 6;
        }
        else if (this.gameMode === GameMode.Playing) {
            this.inputManager.temporaryNoPointerLock = false;
            document.querySelector("#ingame-ui").style.display = "block";
            document.querySelector("#home-page").style.display = "none";
            if (LoadPlayerPositionFromLocalStorage(this)) {
            }
            else {
                this.playerDodo.setWorldPosition(new BABYLON.Vector3(this.terrain.chunckSize_m * 0.5, 10, this.terrain.chunckSize_m * 0.5));
                this.playerDodo.r = 0;
            }
            this.playerDodo.unfold();
            this.networkManager.initialize();
            let playerBrain = this.playerDodo.brain.subBrains[BrainMode.Player];
            let action = await PlayerActionTemplate.CreateBrickAction(playerBrain, "brick_4x1", 0);
            playerBrain.playerActionManager.linkAction(action, 1);
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_1x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_2x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_4x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick_6x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("brick-corner-curved_3x1", InventoryCategory.Brick, this));
            playerBrain.inventory.addItem(new PlayerInventoryItem("tile_4x4", InventoryCategory.Brick, this));
            this.npcManager.instantiate();
            for (let i = 0; i < DodoColors.length; i++) {
                playerBrain.inventory.addItem(new PlayerInventoryItem(DodoColors[i].name, InventoryCategory.Paint, this));
            }
        }
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
            this.networkDodos.forEach(dodo => {
                dodo.update(rawDT);
            });
            this.npcDodos.forEach(dodo => {
                dodo.update(rawDT);
            });
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
class MiniatureFactory {
    constructor(game) {
        this.game = game;
    }
    initialize() {
        let canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        this.engine = new BABYLON.Engine(canvas);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
        this.light = new BABYLON.HemisphericLight("miniature-light", new BABYLON.Vector3(-2, 3, -1).normalize(), this.scene);
        this.camera = new BABYLON.ArcRotateCamera("miniature-camera", -Math.PI / 6, Math.PI / 3, 100, BABYLON.Vector3.Zero());
        this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.camera.orthoTop = 1;
        this.camera.orthoRight = 1;
        this.camera.orthoBottom = -1;
        this.camera.orthoLeft = -1;
        //this.debugDownloadScreenshot();
    }
    async makeBrickIconString(brickId) {
        let canvas = await this.makeBrickIcon(brickId);
        return canvas.toDataURL();
    }
    async makePaintIconString(colorId) {
        let index = DodoColorIdToIndex(colorId);
        let canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        let context = canvas.getContext("2d");
        context.fillStyle = DodoColors[index].hex;
        context.fillRect(0, 0, 2, 2);
        return canvas.toDataURL();
    }
    async makeBrickIcon(brickId) {
        let brickIndex = Brick.BrickIdToIndex(brickId);
        let brick = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
        let template = await BrickTemplateManager.Instance.getTemplate(brickIndex);
        template.vertexData.applyToMesh(brick);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                let center = brick.getBoundingInfo();
                this.camera.target.copyFrom(center.boundingBox.minimumWorld).addInPlace(center.boundingBox.maximumWorld).scaleInPlace(0.5);
                let size = center.boundingBox.maximumWorld.subtract(center.boundingBox.minimumWorld).length();
                this.camera.orthoTop = size * 0.5 + BRICK_S * 0.5;
                this.camera.orthoRight = size * 0.5 + BRICK_S * 0.5;
                this.camera.orthoBottom = -size * 0.5 - BRICK_S * 0.5;
                this.camera.orthoLeft = -size * 0.5 - BRICK_S * 0.5;
                BABYLON.ScreenshotTools.CreateScreenshot(this.engine, this.camera, 256, (data) => {
                    let img = document.createElement("img");
                    img.src = data;
                    img.onload = () => {
                        let canvas = document.createElement("canvas");
                        canvas.width = 256;
                        canvas.height = 256;
                        let context = canvas.getContext("2d");
                        context.drawImage(img, 0, 0);
                        brick.dispose();
                        this.engine.stopRenderLoop();
                        resolve(canvas);
                        /*
                        var tmpLink = document.createElement( 'a' );
                        tmpLink.download = "test.png";
                        tmpLink.href = canvas.toDataURL();
                        
                        document.body.appendChild( tmpLink );
                        tmpLink.click();
                        document.body.removeChild( tmpLink );
                        */
                    };
                });
            });
        });
    }
    debugDownloadScreenshot() {
        console.log("hop hip");
        let box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        requestAnimationFrame(() => {
            BABYLON.ScreenshotTools.CreateScreenshot(this.engine, this.camera, 256, (data) => {
                console.log("hello");
                let img = document.createElement("img");
                img.src = data;
                img.onload = () => {
                    console.log("hoy hoy");
                    let canvas = document.createElement("canvas");
                    canvas.width = 256;
                    canvas.height = 256;
                    let context = canvas.getContext("2d");
                    context.drawImage(img, 0, 0);
                    var tmpLink = document.createElement('a');
                    tmpLink.download = "test.png";
                    tmpLink.href = canvas.toDataURL();
                    document.body.appendChild(tmpLink);
                    tmpLink.click();
                    document.body.removeChild(tmpLink);
                    box.dispose();
                    this.engine.stopRenderLoop();
                };
            });
        });
    }
}
/// <reference path="../lib/peerjs.d.ts"/>
class NetworkManager {
    constructor(game) {
        this.game = game;
        this.token = null;
        this.serverPlayersList = [];
        this.receivedData = new Map();
        ScreenLoger.Log("Create NetworkManager");
        if (window.localStorage.getItem("token")) {
            this.token = window.localStorage.getItem("token");
        }
    }
    async initialize() {
        ScreenLoger.Log("Initialize NetworkManager");
        await this.connectToTiaratumServer();
        if (this.claimedConstructionI != null && this.claimedConstructionJ != null) {
            this.claimConstruction(this.claimedConstructionI, this.claimedConstructionJ);
        }
        this.peer = new Peer();
        this.peer.on("open", this.onPeerOpen.bind(this));
        this.peer.on("error", this.onPeerError.bind(this));
        this.peer.on("connection", this.onPeerConnection.bind(this));
        this.peer.on("disconnected", () => { console.log("disconnected"); });
        this.peer.on("call", () => { console.log("call"); });
    }
    async onPeerError(e) {
        console.error(e);
        ScreenLoger.Log(e);
    }
    async connectToTiaratumServer() {
        let connectPlayerData = {
            peerId: this.game.playerDodo.peerId,
            displayName: this.game.playerDodo.name,
            style: this.game.playerDodo.style,
            posX: this.game.playerDodo.position.x,
            posY: this.game.playerDodo.position.y,
            posZ: this.game.playerDodo.position.z,
            token: this.token
        };
        let dataString = JSON.stringify(connectPlayerData);
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "connect_player", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: dataString,
            });
            let responseText = await response.text();
            console.log(responseText);
            let responseJSON = JSON.parse(responseText);
            this.token = responseJSON.token;
            window.localStorage.setItem("token", this.token);
            this.game.playerDodo.gameId = responseJSON.gameId;
            console.log("playerDodo.gameId = " + this.game.playerDodo.gameId.toFixed(0));
            ScreenLoger.Log("playerDodo.gameId = " + this.game.playerDodo.gameId.toFixed(0));
            console.log("token = " + this.token);
            ScreenLoger.Log("token = " + this.token);
        }
        catch (e) {
            console.error(e);
            ScreenLoger.Log("connect_player error");
            ScreenLoger.Log(e);
        }
    }
    async onPeerOpen(id) {
        ScreenLoger.Log("Open peer connection, my ID is " + id);
        this.game.playerDodo.peerId = id;
        await this.connectToTiaratumServer();
        try {
            const responseExistingPlayers = await fetch(SHARE_SERVICE_PATH + "get_players", {
                method: "GET",
                mode: "cors"
            });
            let responseText = await responseExistingPlayers.text();
            console.log(responseText);
            let responseJSON = JSON.parse(responseText);
            console.log(responseJSON);
            this.serverPlayersList = responseJSON.players;
            for (let n = 0; n < responseJSON.players.length; n++) {
                let otherPlayer = responseJSON.players[n];
                if (otherPlayer.peerId != this.game.playerDodo.peerId) {
                    this.connectToPlayer(otherPlayer.peerId);
                }
            }
        }
        catch (e) {
            console.error(e);
            ScreenLoger.Log("get_players error");
            ScreenLoger.Log(e);
        }
    }
    connectToPlayer(playerId) {
        console.log("Connecting to player of ID'" + playerId + "'");
        let conn = this.peer.connect(playerId);
        conn.on("open", () => {
            this.onPeerConnection(conn);
        });
    }
    async onPeerConnection(conn) {
        console.log("Incoming connection, other ID is '" + conn.peer + "'");
        let existingDodo = this.game.networkDodos.find(dodo => { return dodo.peerId === conn.peer; });
        if (!existingDodo) {
            let playerDesc = this.serverPlayersList.find(p => { return p.peerId === conn.peer; });
            let style = "00000000";
            if (playerDesc) {
                style = playerDesc.style;
            }
            existingDodo = await this.createDodo("Unknown", conn.peer, style);
            this.game.networkDodos.push(existingDodo);
        }
        conn.on('data', (data) => {
            this.onConnData(data, conn);
        });
        conn.send(JSON.stringify({ style: this.game.playerDodo.style }));
        setInterval(() => {
            conn.send(JSON.stringify({
                dodoId: this.game.playerDodo.peerId,
                x: this.game.playerDodo.position.x,
                y: this.game.playerDodo.position.y,
                z: this.game.playerDodo.position.z,
                tx: this.game.playerDodo.targetLook.x,
                ty: this.game.playerDodo.targetLook.y,
                tz: this.game.playerDodo.targetLook.z,
                r: this.game.playerDodo.r
            }));
        }, 100);
    }
    onConnData(dataString, conn) {
        let data = JSON.parse(dataString);
        if (IsStyleNetworkData(data)) {
            let dodo = this.game.networkDodos.find(dodo => { return dodo.peerId === conn.peer; });
            if (dodo) {
                dodo.setStyle(data.style);
            }
        }
        else if (IsBrainNetworkData(data)) {
            let brainNetworkData = data;
            brainNetworkData.timestamp = performance.now();
            let dataArray = this.receivedData.get(brainNetworkData.dodoId);
            if (!dataArray) {
                dataArray = [];
                this.receivedData.set(brainNetworkData.dodoId, dataArray);
            }
            dataArray.push(brainNetworkData);
            dataArray.sort((d1, d2) => { return d2.timestamp - d1.timestamp; });
            while (dataArray.length > 10) {
                dataArray.pop();
            }
        }
    }
    async createDodo(name, peerId, style) {
        let dodo = new Dodo(peerId, name, this.game, {
            speed: 1.5 + Math.random(),
            stepDuration: 0.2 + 0.2 * Math.random(),
            style: style
        });
        await dodo.instantiate();
        dodo.unfold();
        dodo.setWorldPosition(new BABYLON.Vector3(-5 + 10 * Math.random(), 1, -5 + 10 * Math.random()));
        dodo.brain = new Brain(dodo, BrainMode.Network);
        dodo.brain.initialize();
        return dodo;
    }
    async claimConstruction(i, j) {
        let token = this.game.networkManager.token;
        let constructionData = {
            i: i,
            j: j,
            token: token
        };
        ScreenLoger.Log("ClaimConstruction " + i + " " + j + " with " + token);
        let headers = {
            "Content-Type": "application/json",
        };
        let dataString = JSON.stringify(constructionData);
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "claim_construction", {
                method: "POST",
                mode: "cors",
                headers: headers,
                body: dataString,
            });
            let responseText = await response.text();
            if (responseText) {
                let response = JSON.parse(responseText);
                if (response) {
                    this.game.networkManager.claimedConstructionI = response.i;
                    this.game.networkManager.claimedConstructionJ = response.j;
                    SavePlayerToLocalStorage(this.game);
                    let construction = this.game.terrainManager.getConstruction(this.game.networkManager.claimedConstructionI, this.game.networkManager.claimedConstructionJ);
                    if (construction) {
                        construction.showLimits();
                    }
                    return response;
                }
            }
        }
        catch (e) {
            console.error(e);
            ScreenLoger.Log("ClaimConstruction error");
            ScreenLoger.Log(e);
            return undefined;
        }
        this.game.networkManager.claimedConstructionI = null;
        this.game.networkManager.claimedConstructionJ = null;
        SavePlayerToLocalStorage(this.game);
        return undefined;
    }
}
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
class OutlinePostProcess {
    static AddOutlinePostProcess(camera) {
        let scene = camera.getScene();
        let engine = scene.getEngine();
        BABYLON.Effect.ShadersStore["EdgeFragmentShader"] = `
			#ifdef GL_ES
			precision highp float;
			#endif
			varying vec2 vUV;
			uniform sampler2D textureSampler;
			uniform sampler2D depthSampler;
			uniform float 		width;
			uniform float 		height;
			void make_kernel_color(inout vec4 n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h));
				n[1] = texture2D(tex, coord + vec2(0.0, -h));
				n[2] = texture2D(tex, coord + vec2(  w, -h));
				n[3] = texture2D(tex, coord + vec2( -w, 0.0));
				n[4] = texture2D(tex, coord);
				n[5] = texture2D(tex, coord + vec2(  w, 0.0));
				n[6] = texture2D(tex, coord + vec2( -w, h));
				n[7] = texture2D(tex, coord + vec2(0.0, h));
				n[8] = texture2D(tex, coord + vec2(  w, h));
			}
			
			void make_kernel_depth(inout float n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h)).r;
				n[1] = texture2D(tex, coord + vec2(0.0, -h)).r;
				n[2] = texture2D(tex, coord + vec2(  w, -h)).r;
				n[3] = texture2D(tex, coord + vec2( -w, 0.0)).r;
				n[4] = texture2D(tex, coord).r;
				n[5] = texture2D(tex, coord + vec2(  w, 0.0)).r;
				n[6] = texture2D(tex, coord + vec2( -w, h)).r;
				n[7] = texture2D(tex, coord + vec2(0.0, h)).r;
				n[8] = texture2D(tex, coord + vec2(  w, h)).r;
			}

			void main(void) 
			{
				vec4 d = texture2D(depthSampler, vUV);
				float depth = d.r * (1000.0 - 0.1) + 0.1;
				float depthFactor = d.r;
				
				float nD[9];
				make_kernel_depth( nD, depthSampler, vUV );
				float sobel_depth_edge_h = nD[2] + (2.0*nD[5]) + nD[8] - (nD[0] + (2.0*nD[3]) + nD[6]);
				float sobel_depth_edge_v = nD[0] + (2.0*nD[1]) + nD[2] - (nD[6] + (2.0*nD[7]) + nD[8]);
				float sobel_depth = sqrt((sobel_depth_edge_h * sobel_depth_edge_h) + (sobel_depth_edge_v * sobel_depth_edge_v));

				vec4 n[9];
				make_kernel_color( n, textureSampler, vUV );
				vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
				vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
				vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
				
				gl_FragColor = n[4];
				if (max(sobel.r, max(sobel.g, sobel.b)) > 20. * depthFactor) {
					gl_FragColor = n[4] * 0.9;
					gl_FragColor.a = 1.0;
				}
				if (sobel_depth > 0.2 * depthFactor) {
					//gl_FragColor = vec4(0.);
					//gl_FragColor.a = 1.0;
				}
			}
        `;
        let depthMap = scene.enableDepthRenderer(camera).getDepthMap();
        let postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, camera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", engine.getRenderWidth());
            effect.setFloat("height", engine.getRenderHeight());
        };
        return postProcess;
    }
}
class PerformanceWatcher {
    constructor(game) {
        this.game = game;
        this.supportTexture3D = false;
        this.average = 24;
        this.worst = 24;
        this.isWorstTooLow = false;
        this.devicePixelRationess = 10;
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
        return;
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
class PlayerCamera extends BABYLON.FreeCamera {
    constructor(game) {
        super("player-camera", BABYLON.Vector3.Zero());
        this.game = game;
        this._verticalAngle = 0;
        this.pivotHeight = 2;
        this.pivotHeightHome = 0.5;
        this.pivotRecoil = 4;
        this.playerPosY = 0;
        this.dialogOffset = BABYLON.Vector3.Zero();
        this.dialogRotation = 0;
        this.minZ = 0.1;
        this.maxZ = 1000;
    }
    get verticalAngle() {
        return this._verticalAngle;
    }
    set verticalAngle(v) {
        this._verticalAngle = Nabu.MinMax(v, -Math.PI / 2, Math.PI / 2);
    }
    onUpdate(dt) {
        if (this.player) {
            if (this.game.gameMode === GameMode.Home) {
                let target = new BABYLON.Vector3(0, 0, -this.pivotRecoil);
                Mummu.RotateInPlace(target, BABYLON.Axis.X, this.verticalAngle);
                let targetLook = target.clone().scaleInPlace(-5);
                let fYSmooth = Nabu.Easing.smoothNSec(1 / dt, 1);
                this.playerPosY = this.playerPosY * fYSmooth + this.player.position.y * (1 - fYSmooth);
                target.y += this.pivotHeightHome;
                target.x += this.player.position.x;
                target.y += this.playerPosY;
                target.z += this.player.position.z;
                targetLook.y += this.pivotHeightHome;
                targetLook.x += this.player.position.x;
                targetLook.y += this.player.position.y;
                targetLook.z += this.player.position.z;
                this.position.copyFrom(target);
                if (IsVertical) {
                    this.position.x += 0.4;
                }
                let dir = targetLook.subtract(this.position);
                this.rotationQuaternion = Mummu.QuaternionFromZYAxis(dir, BABYLON.Axis.Y);
            }
            else if (this.game.gameMode === GameMode.Playing) {
                let f = Nabu.Easing.smoothNSec(1 / dt, 0.5);
                if (this.game.playerBrain.inDialog) {
                    let dialogOffset = this.game.playerBrain.inDialog.dodo.position.subtract(this.player.position).scale(0.5);
                    dialogOffset.y -= this.pivotHeight;
                    dialogOffset.y += 0.5;
                    BABYLON.Vector3.LerpToRef(this.dialogOffset, dialogOffset, 1 - f, this.dialogOffset);
                    this.dialogRotation = this.dialogRotation * f + Math.PI * 0.5 * (1 - f);
                }
                else {
                    this.dialogOffset.scaleInPlace(f);
                    this.dialogRotation *= f;
                }
                let target = this.player.forward.scale(-this.pivotRecoil);
                Mummu.RotateInPlace(target, this.player.right, this.verticalAngle);
                Mummu.RotateInPlace(target, BABYLON.Axis.Y, this.dialogRotation);
                let targetLook = target.clone().scaleInPlace(-5);
                let fYSmooth = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                this.playerPosY = this.playerPosY * fYSmooth + this.player.position.y * (1 - fYSmooth);
                target.y += this.pivotHeight;
                target.x += this.player.position.x;
                target.y += this.playerPosY;
                target.z += this.player.position.z;
                target.addInPlace(this.dialogOffset);
                targetLook.y += this.pivotHeight;
                targetLook.x += this.player.position.x;
                targetLook.y += this.player.position.y;
                targetLook.z += this.player.position.z;
                targetLook.addInPlace(this.dialogOffset);
                this.position.copyFrom(target);
                let dir = targetLook.subtract(this.position);
                this.rotationQuaternion = Mummu.QuaternionFromZYAxis(dir, BABYLON.Axis.Y);
            }
        }
    }
}
class ScreenLoger {
    static get container() {
        if (!ScreenLoger._container) {
            ScreenLoger._container = document.createElement("div");
            ScreenLoger._container.id = "screen-loger-container";
            document.body.appendChild(ScreenLoger._container);
        }
        return ScreenLoger._container;
    }
    static Log(s) {
        let line = document.createElement("div");
        line.classList.add("screen-loger-line");
        line.innerText = s;
        ScreenLoger.container.appendChild(line);
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
var BRICK_S = 0.336;
var BRICK_H = 0.134;
var TILE_S = BRICK_S * 2;
var TILE_H = BRICK_H * 3;
class Chunck extends BABYLON.Mesh {
    constructor(i, j, terrain) {
        super("chunck_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.i = i;
        this.j = j;
        this.terrain = terrain;
        this.position.copyFromFloats(this.i * this.terrain.chunckSize_m + BRICK_S * 0.5, 0, this.j * this.terrain.chunckSize_m + BRICK_S * 0.5);
    }
}
class Terrain {
    constructor(game) {
        this.game = game;
        this.worldZero = 100;
        this.chunckLength = 64;
        this.chunckSize_m = this.chunckLength * TILE_S;
        this.mapL = 512;
        this.chuncks = new Nabu.UniqueList();
        let masterSeed = Nabu.MasterSeed.GetFor("Paulita&Sven");
        let seededMap = Nabu.SeededMap.CreateFromMasterSeed(masterSeed, 4, 512);
        this.mapL = 1024;
        this.generator = new Nabu.TerrainMapGenerator(seededMap, [32, 16]);
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
    worldPosToTerrainAltitude(position) {
        let x = position.x - BRICK_S * 0.5;
        let z = position.z - BRICK_S * 0.5;
        let iTile = Math.floor(x / TILE_S);
        let jTile = Math.floor(z / TILE_S);
        let di = (x - iTile * TILE_S) / TILE_S;
        let dj = (z - jTile * TILE_S) / TILE_S;
        let IMap = this.worldZero + Math.floor(iTile / this.mapL);
        let JMap = this.worldZero + Math.floor(jTile / this.mapL);
        let map = this.generator.getMapIfLoaded(IMap, JMap);
        if (map) {
            let i = iTile % this.mapL;
            while (i < 0) {
                i += this.mapL;
            }
            let j = jTile % this.mapL;
            while (j < 0) {
                j += this.mapL;
            }
            let h00 = (map.getClamped(i, j) - 128);
            let h10 = (map.getClamped(i + 1, j) - 128);
            let h01 = (map.getClamped(i, j + 1) - 128);
            let h11 = (map.getClamped(i + 1, j + 1) - 128);
            h00 = Math.floor(h00 / 16) + 1;
            h10 = Math.floor(h10 / 16) + 1;
            h01 = Math.floor(h01 / 16) + 1;
            h11 = Math.floor(h11 / 16) + 1;
            let h0 = h00 * (1 - di) + h10 * di;
            let h1 = h01 * (1 - di) + h11 * di;
            return (h0 * (1 - dj) + h1 * dj) * TILE_H;
        }
        return 0;
    }
    async generateChunck(iChunck, jChunck) {
        let IMap = this.worldZero + Math.floor(iChunck * this.chunckLength / this.mapL);
        let JMap = this.worldZero + Math.floor(jChunck * this.chunckLength / this.mapL);
        this._tmpMaps = [];
        this._tmpMaps = [];
        for (let i = 0; i < 3; i++) {
            this._tmpMaps[i] = [];
            for (let j = 0; j < 3; j++) {
                this._tmpMaps[i][j] = await this.generator.getMap(IMap + i - 1, JMap + j - 1);
            }
        }
        let chunck = new Chunck(iChunck, jChunck, this);
        chunck.material = this.material;
        let water = new BABYLON.Mesh("water");
        BABYLON.CreateGroundVertexData({ size: this.chunckSize_m }).applyToMesh(water);
        water.position.copyFromFloats(this.chunckSize_m * 0.5, -0.5 / 3, this.chunckSize_m * 0.5);
        water.material = this.waterMaterial;
        water.parent = chunck;
        let l = this.chunckLength;
        let lInc = l + 1;
        let vertexData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let iOffset = (iChunck * this.chunckLength) % this.mapL;
        if (iOffset < 0) {
            iOffset = this.mapL + iOffset;
        }
        let jOffset = (jChunck * this.chunckLength) % this.mapL;
        if (jOffset < 0) {
            jOffset = this.mapL + jOffset;
        }
        for (let j = 0; j <= l; j++) {
            for (let i = 0; i <= l; i++) {
                let h = this.tmpMapGet(iOffset + i, jOffset + j) - 128;
                h = Math.floor(h / 16) + 1;
                positions.push(i * TILE_S, h * TILE_H, j * TILE_S);
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
                h = Math.floor(h / 16) + 1;
                hIP = Math.floor(hIP / 16) + 1;
                hIM = Math.floor(hIM / 16) + 1;
                hJP = Math.floor(hJP / 16) + 1;
                hJM = Math.floor(hJM / 16) + 1;
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
        this.range = 10;
        this.createChunckTasks = [];
        this.disposeChunckTasks = [];
        this.createConstructionTasks = [];
        this.disposeConstructionTasks = [];
        this.constructions = [];
        this._lastRefreshChunckPosition = new BABYLON.Vector3(Infinity, 0, Infinity);
        this._lastRefreshConstructionPosition = new BABYLON.Vector3(Infinity, 0, Infinity);
        this._lock = false;
    }
    get game() {
        return this.terrain.game;
    }
    getConstruction(i, j) {
        return this.constructions.find(c => { return c.i === i && c.j === j; });
    }
    getOrCreateConstruction(i, j) {
        let construction = this.getConstruction(i, j);
        if (!construction) {
            construction = new Construction(i, j, this.terrain);
            this.constructions.push(construction);
        }
        return construction;
    }
    addCreateChunckTask(i, j) {
        let disposeTaskIndex = this.disposeChunckTasks.findIndex(t => { return t.i === i && t.j === j; });
        if (disposeTaskIndex >= 0) {
            this.disposeChunckTasks.splice(disposeTaskIndex, 1);
        }
        if (!this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j; })) {
            if (!this.createChunckTasks.find(t => { return t.i === i && t.j === j; })) {
                this.createChunckTasks.push({ i: i, j: j });
            }
        }
    }
    addDisposeChunckTask(i, j) {
        let createTaskIndex = this.createChunckTasks.findIndex(t => { return t.i === i && t.j === j; });
        if (createTaskIndex >= 0) {
            this.createChunckTasks.splice(createTaskIndex, 1);
        }
        if (this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j; })) {
            if (!this.disposeChunckTasks.find(t => { return t.i === i && t.j === j; })) {
                this.disposeChunckTasks.push({ i: i, j: j });
            }
        }
    }
    refreshChunckTaskList() {
        let position = this.game.camera.globalPosition.clone();
        position.y = 0;
        let iCenter = Math.floor(position.x / this.terrain.chunckSize_m);
        let jCenter = Math.floor(position.z / this.terrain.chunckSize_m);
        for (let i = iCenter - 4; i <= iCenter + 4; i++) {
            for (let j = jCenter - 4; j <= jCenter + 4; j++) {
                let cx = (i + 0.5) * this.terrain.chunckSize_m;
                let cz = (j + 0.5) * this.terrain.chunckSize_m;
                let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
                if (d < this.range * this.terrain.chunckSize_m) {
                    this.addCreateChunckTask(i, j);
                }
            }
        }
        this.terrain.chuncks.forEach(chunck => {
            let cx = (chunck.i + 0.5) * this.terrain.chunckSize_m;
            let cz = (chunck.j + 0.5) * this.terrain.chunckSize_m;
            let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
            if (d > (this.range + 1) * this.terrain.chunckSize_m) {
                this.addDisposeChunckTask(chunck.i, chunck.j);
            }
        });
        this.createChunckTasks.sort((t1, t2) => {
            let di1 = t1.i - iCenter;
            let dj1 = t1.j - jCenter;
            let di2 = t2.i - iCenter;
            let dj2 = t2.j - jCenter;
            return (di2 * di2 + dj2 * dj2) - (di1 * di1 + dj1 * dj1);
        });
        this._lastRefreshChunckPosition = position;
    }
    addCreateConstructionTask(i, j) {
        let disposeTaskIndex = this.disposeConstructionTasks.findIndex(t => { return t.i === i && t.j === j; });
        if (disposeTaskIndex >= 0) {
            this.disposeConstructionTasks.splice(disposeTaskIndex, 1);
        }
        if (!this.constructions.find(construction => { return construction.i === i && construction.j === j; })) {
            if (!this.createConstructionTasks.find(t => { return t.i === i && t.j === j; })) {
                this.createConstructionTasks.push({ i: i, j: j });
            }
        }
    }
    addDisposeConstructionTask(i, j) {
        let createTaskIndex = this.createConstructionTasks.findIndex(t => { return t.i === i && t.j === j; });
        if (createTaskIndex >= 0) {
            this.createConstructionTasks.splice(createTaskIndex, 1);
        }
        if (this.constructions.find(construction => { return construction.i === i && construction.j === j; })) {
            if (!this.disposeConstructionTasks.find(t => { return t.i === i && t.j === j; })) {
                this.disposeConstructionTasks.push({ i: i, j: j });
            }
        }
    }
    refreshConstructionTaskList() {
        let position = this.game.camera.globalPosition.clone();
        position.y = 0;
        let iCenter = Math.floor(position.x / Construction.SIZE_m);
        let jCenter = Math.floor(position.z / Construction.SIZE_m);
        for (let i = iCenter - 4; i <= iCenter + 4; i++) {
            for (let j = jCenter - 4; j <= jCenter + 4; j++) {
                let cx = (i + 0.5) * Construction.SIZE_m;
                let cz = (j + 0.5) * Construction.SIZE_m;
                let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
                if (d < this.range * Construction.SIZE_m) {
                    this.addCreateConstructionTask(i, j);
                }
            }
        }
        this.constructions.forEach(construction => {
            let cx = (construction.i + 0.5) * Construction.SIZE_m;
            let cz = (construction.j + 0.5) * Construction.SIZE_m;
            let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
            if (d > (this.range + 1) * Construction.SIZE_m) {
                this.addDisposeConstructionTask(construction.i, construction.j);
            }
        });
        this._lastRefreshConstructionPosition = position;
    }
    async update() {
        if (this._lock) {
            return;
        }
        this._lock = true;
        let position = this.game.camera.globalPosition;
        if (Math.abs(position.x - this._lastRefreshChunckPosition.x) > this.terrain.chunckSize_m * 0.25 || Math.abs(position.z - this._lastRefreshChunckPosition.z) > this.terrain.chunckSize_m * 0.25) {
            this.refreshChunckTaskList();
        }
        if (Math.abs(position.x - this._lastRefreshConstructionPosition.x) > this.terrain.chunckSize_m * 0.25 || Math.abs(position.z - this._lastRefreshConstructionPosition.z) > this.terrain.chunckSize_m * 0.25) {
            this.refreshConstructionTaskList();
        }
        if (this.createChunckTasks.length > 0) {
            let task = this.createChunckTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j; });
            if (!chunck) {
                chunck = await this.terrain.generateChunck(task.i, task.j);
                this.terrain.chuncks.push(chunck);
            }
        }
        else if (this.disposeChunckTasks.length > 0) {
            let task = this.disposeChunckTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j; });
            if (chunck) {
                this.terrain.chuncks.remove(chunck);
                chunck.dispose();
            }
        }
        if (this.createConstructionTasks.length > 0) {
            let task = this.createConstructionTasks.pop();
            let construction = this.constructions.find(construction => { return construction.i === task.i && construction.j === task.j; });
            if (!construction) {
                construction = this.getOrCreateConstruction(task.i, task.j);
                //construction.buildFromLocalStorage();
                await construction.instantiate();
                construction.buildFromServer();
                this.constructions.push(construction);
            }
        }
        else if (this.disposeConstructionTasks.length > 0) {
            let task = this.disposeConstructionTasks.pop();
            let constructionIndex = this.constructions.findIndex(construction => { return construction.i === task.i && construction.j === task.j; });
            if (constructionIndex != -1) {
                let construction = this.constructions[constructionIndex];
                this.constructions.splice(constructionIndex, 1);
                construction.dispose();
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
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: [
                "world", "worldView", "worldViewProjection", "view", "projection",
                "useVertexColor",
                "useLightFromPOV",
                "autoLight",
                "diffuseSharpness",
                "diffuse",
                "diffuseTexture",
                "normalTexture",
                "viewPositionW",
                "viewDirectionW",
                "lightInvDirW",
                "alpha",
                "useFlatSpecular",
                "specularIntensity",
                "specularColor",
                "specularCount",
                "specularPower"
            ]
        });
        this.scene = scene;
        this._update = () => {
            let camera = this.scene.activeCamera;
            let direction = camera.getForwardRay().direction;
            this.setVector3("viewPositionW", camera.globalPosition);
            this.setVector3("viewDirectionW", direction);
            let lights = this.scene.lights;
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
        this._diffuseCount = 4;
        this._useFlatSpecular = false;
        this._specularIntensity = 0;
        this._specular = BABYLON.Color3.White();
        this._specularCount = 1;
        this._specularPower = 4;
        this._whiteTexture = new BABYLON.Texture("./datas/textures/void-texture.png");
        this._whiteTexture.wrapU = 1;
        this._whiteTexture.wrapV = 1;
        this._blackTexture = new BABYLON.Texture("./datas/textures/black-texture.png");
        this._blackTexture.wrapU = 1;
        this._blackTexture.wrapV = 1;
        this.updateUseVertexColor();
        this.updateUseLightFromPOV();
        this.updateAutoLight();
        this.updateDiffuseSharpness();
        this.updateDiffuse();
        this.updateDiffuseCount();
        this.updateDiffuseTexture();
        this.updateNormalTexture();
        this.updateAlpha();
        this.updateUseFlatSpecular();
        this.updateSpecularIntensity();
        this.updateSpecular();
        this.updateSpecularCount();
        this.updateSpecularPower();
        this.setVector3("viewPositionW", BABYLON.Vector3.Zero());
        this.setVector3("viewDirectionW", BABYLON.Vector3.Up());
        this.setVector3("lightInvDirW", BABYLON.Vector3.Up());
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        super.dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
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
    get diffuseCount() {
        return this._diffuseCount;
    }
    setDiffuseCount(v) {
        this._diffuseCount = v;
        this.updateDiffuseCount();
    }
    updateDiffuseCount() {
        this.setFloat("diffuseCount", this._diffuseCount);
    }
    get diffuseTexture() {
        return this._diffuseTexture;
    }
    setDiffuseTexture(t) {
        this._diffuseTexture = t;
        this.updateDiffuseTexture();
    }
    updateDiffuseTexture() {
        if (this._diffuseTexture) {
            this.setTexture("diffuseTexture", this._diffuseTexture);
        }
        else {
            this.setTexture("diffuseTexture", this._whiteTexture);
        }
    }
    get normalTexture() {
        return this._normalTexture;
    }
    setNormalTexture(t) {
        this._normalTexture = t;
        this.updateNormalTexture();
    }
    updateNormalTexture() {
        if (this._normalTexture) {
            this.setTexture("normalTexture", this._normalTexture);
        }
        else {
            this.setTexture("normalTexture", this._blackTexture);
        }
    }
    get alpha() {
        return this._alpha;
    }
    setAlpha(v) {
        this._alpha = v;
        this.updateAlpha();
    }
    updateAlpha() {
        if (this.alpha != 1) {
            this.alphaMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        }
        else {
            this.alphaMode = BABYLON.Material.MATERIAL_OPAQUE;
        }
        this.setFloat("alpha", this._alpha);
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
class TouchJoystick extends HTMLElement {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this.onJoystickChange = (x, y) => {
        };
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    connectedCallback() {
        this.innerHTML = `
            <svg viewBox="0 0 210 210">
				<path class="touch-joystick-up" fill="white" d="M 177.45744,29.007337 C 136.89421,-9.6690832 73.105713,-9.6692443 32.54229,29.006971 l 31.836133,31.836133 c 22.96201,-21.123357 58.281247,-21.123357 81.243257,0 z"></path>
				<path class="touch-joystick-right" fill="white" d="M 177.45744,29.007337 C 136.89421,-9.6690832 73.105713,-9.6692443 32.54229,29.006971 l 31.836133,31.836133 c 22.96201,-21.123357 58.281247,-21.123357 81.243257,0 z" transform="rotate(90 105 105)"></path>
				<path class="touch-joystick-bottom" fill="white" d="M 177.45744,29.007337 C 136.89421,-9.6690832 73.105713,-9.6692443 32.54229,29.006971 l 31.836133,31.836133 c 22.96201,-21.123357 58.281247,-21.123357 81.243257,0 z" transform="rotate(180 105 105)"></path>
				<path class="touch-joystick-left" fill="white" d="M 177.45744,29.007337 C 136.89421,-9.6690832 73.105713,-9.6692443 32.54229,29.006971 l 31.836133,31.836133 c 22.96201,-21.123357 58.281247,-21.123357 81.243257,0 z" transform="rotate(270 105 105)"></path>
			</svg>
        `;
        this._upPath = this.querySelector(".touch-joystick-up");
        this._rightPath = this.querySelector(".touch-joystick-right");
        this._bottomPath = this.querySelector(".touch-joystick-bottom");
        this._leftPath = this.querySelector(".touch-joystick-left");
        this.addEventListener("pointerdown", (ev) => {
            this._touchInputDown = true;
            let rect = this.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;
            let s = rect.width;
            this.setX((x / s - 0.5) * 2);
            this.setY(-((y / s - 0.5) * 2));
            ev.preventDefault();
        });
        this.addEventListener("pointerenter", (ev) => {
            this._touchInputDown = true;
            let rect = this.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;
            let s = rect.width;
            this.setX((x / s - 0.5) * 2);
            this.setY(-((y / s - 0.5) * 2));
            ev.preventDefault();
        });
        this.addEventListener("pointerup", (ev) => {
            this._touchInputDown = false;
            this.setX(0);
            this.setY(0);
            ev.preventDefault();
        });
        this.addEventListener("pointerleave", (ev) => {
            this._touchInputDown = false;
            this.setX(0);
            this.setY(0);
            ev.preventDefault();
        });
        this.addEventListener("pointermove", (ev) => {
            if (this._touchInputDown) {
                let rect = this.getBoundingClientRect();
                let x = ev.clientX - rect.left;
                let y = ev.clientY - rect.top;
                let s = rect.width;
                this.setX((x / s - 0.5) * 2);
                this.setY(-((y / s - 0.5) * 2));
            }
        });
    }
    setX(x) {
        this._x = x;
        let rightOpacity = 0.2;
        if (x > 0) {
            rightOpacity = 0.2 + 0.8 * x;
        }
        this._rightPath.setAttribute("opacity", rightOpacity.toFixed(2));
        let leftOpacity = 0.2;
        if (x < 0) {
            leftOpacity = 0.2 + 0.8 * Math.abs(x);
        }
        this._leftPath.setAttribute("opacity", leftOpacity.toFixed(2));
        this.onJoystickChange(this.x, this.y);
    }
    setY(y) {
        this._y = y;
        let topOpacity = 0.2;
        if (y > 0) {
            topOpacity = 0.2 + 0.8 * y;
        }
        this._upPath.setAttribute("opacity", topOpacity.toFixed(2));
        let bottomOpacity = 0.2;
        if (y < 0) {
            bottomOpacity = 0.2 + 0.8 * Math.abs(y);
        }
        this._bottomPath.setAttribute("opacity", bottomOpacity.toFixed(2));
        this.onJoystickChange(this.x, this.y);
    }
}
customElements.define("touch-joystick", TouchJoystick);
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
class BrickMenuView extends HTMLElement {
    constructor() {
        super(...arguments);
        this._loaded = false;
        this._shown = false;
        this.currentPointers = 0;
        this._timer = 0;
    }
    static get observedAttributes() {
        return [];
    }
    get loaded() {
        return this._loaded;
    }
    waitLoaded() {
        return new Promise(resolve => {
            let step = () => {
                if (this.loaded) {
                    resolve();
                }
                else {
                    requestAnimationFrame(step);
                }
            };
            step();
        });
    }
    get shown() {
        return this._shown;
    }
    get onLoad() {
        return this._onLoad;
    }
    set onLoad(callback) {
        this._onLoad = callback;
        if (this._loaded) {
            this._onLoad();
        }
    }
    currentPointerUp() {
        if (this._options.length > 0) {
            this.setPointer((this.currentPointers - 1 + this._options.length) % this._options.length);
        }
    }
    currentPointerDown() {
        if (this._options.length > 0) {
            this.setPointer((this.currentPointers + 1) % this._options.length);
        }
    }
    setPointer(n) {
        if (this._options[this.currentPointers]) {
            this._options[this.currentPointers].classList.remove("highlit");
        }
        this.currentPointers = n;
        if (this._options[this.currentPointers]) {
            this._options[this.currentPointers].classList.add("highlit");
        }
    }
    _makeCategoryBtnStyle(btn) {
        btn.style.fontSize = "min(2svh, 2vw)";
        btn.style.display = "block";
        btn.style.marginRight = "1%";
        btn.style.paddingTop = "0.5%";
        btn.style.paddingBottom = "0.5%";
        btn.style.width = "20%";
        btn.style.textAlign = "center";
        btn.style.borderLeft = "2px solid white";
        btn.style.borderTop = "2px solid white";
        btn.style.borderRight = "2px solid white";
        btn.style.borderTopLeftRadius = "10px";
        btn.style.borderTopRightRadius = "10px";
    }
    _makeCategoryBtnActive(btn) {
        btn.style.borderLeft = "2px solid white";
        btn.style.borderTop = "2px solid white";
        btn.style.borderRight = "2px solid white";
        btn.style.color = "#272b2e";
        btn.style.backgroundColor = "white";
        btn.style.fontWeight = "bold";
    }
    _makeCategoryBtnInactive(btn) {
        btn.style.borderLeft = "2px solid #7F7F7F";
        btn.style.borderTop = "2px solid #7F7F7F";
        btn.style.borderRight = "2px solid #7F7F7F";
        btn.style.borderBottom = "";
        btn.style.color = "#7F7F7F";
        btn.style.backgroundColor = "";
        btn.style.fontWeight = "";
    }
    connectedCallback() {
        this.style.display = "none";
        this.style.opacity = "0";
        this._title = document.createElement("h1");
        this._title.classList.add("brick-menu-title");
        this._title.innerHTML = "BRICK";
        this.appendChild(this._title);
        let categoriesContainer;
        categoriesContainer = document.createElement("div");
        this.appendChild(categoriesContainer);
        this._anchorBtn = document.createElement("button");
        this._anchorBtn.innerHTML = "ANCHOR";
        categoriesContainer.appendChild(this._anchorBtn);
        this._anchorBtn.onclick = () => {
            if (this._brick) {
                //this._brick.root.anchored = !this._brick.root.anchored;
            }
            this.hide(0.1);
        };
        this._copyBrickBtn = document.createElement("button");
        this._copyBrickBtn.innerHTML = "COPY BRICK";
        categoriesContainer.appendChild(this._copyBrickBtn);
        this._copyBrickBtn.onclick = async () => {
            this._player.currentAction = await PlayerActionTemplate.CreateBrickAction(this._player, this._brick.index, this._brick.colorIndex);
            this.hide(0.1);
        };
        this._copyWithChildrenBtn = document.createElement("button");
        this._copyWithChildrenBtn.innerHTML = "COPY FULL";
        categoriesContainer.appendChild(this._copyWithChildrenBtn);
        this._copyWithChildrenBtn.onclick = () => {
            let clone = this._brick.cloneWithChildren();
            //clone.updateMesh();
            this._player.currentAction = PlayerActionMoveBrick.Create(this._player, clone);
            this.hide(0.1);
        };
        this._copyColorBtn = document.createElement("button");
        this._copyColorBtn.innerHTML = "COPY COLOR";
        categoriesContainer.appendChild(this._copyColorBtn);
        this._copyColorBtn.onclick = () => {
            this._player.currentAction = PlayerActionTemplate.CreatePaintAction(this._player, this._brick.colorIndex);
            this.hide(0.1);
        };
        this._cancelBtn = document.createElement("button");
        this._cancelBtn.innerHTML = "CANCEL";
        categoriesContainer.appendChild(this._cancelBtn);
        this._cancelBtn.onclick = () => {
            this.hide(0.1);
        };
        this._options = [
            this._anchorBtn,
            this._copyBrickBtn,
            this._copyColorBtn,
            this._cancelBtn,
        ];
    }
    attributeChangedCallback(name, oldValue, newValue) { }
    async show(duration = 1) {
        return new Promise((resolve) => {
            if (!this._shown) {
                this._shown = true;
                this.style.display = "block";
                let opacity0 = parseFloat(this.style.opacity);
                let opacity1 = 1;
                let t0 = performance.now();
                let step = () => {
                    let t = performance.now();
                    let dt = (t - t0) / 1000;
                    if (dt >= duration) {
                        this.style.opacity = "1";
                        resolve();
                    }
                    else {
                        let f = dt / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                        requestAnimationFrame(step);
                    }
                };
                step();
            }
        });
    }
    async hide(duration = 1) {
        if (duration === 0) {
            this._shown = false;
            this.style.display = "none";
            this.style.opacity = "0";
        }
        else {
            return new Promise((resolve) => {
                if (this._shown) {
                    this._shown = false;
                    this.style.display = "block";
                    let opacity0 = parseFloat(this.style.opacity);
                    let opacity1 = 0;
                    let t0 = performance.now();
                    let step = () => {
                        let t = performance.now();
                        let dt = (t - t0) / 1000;
                        if (dt >= duration) {
                            this.style.display = "none";
                            this.style.opacity = "0";
                            if (this.onNextHide) {
                                this.onNextHide();
                                this.onNextHide = undefined;
                            }
                            resolve();
                        }
                        else {
                            let f = dt / duration;
                            this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                            requestAnimationFrame(step);
                        }
                    };
                    step();
                }
            });
        }
    }
    setPlayer(player) {
        this._player = player;
    }
    setBrick(brick) {
        this._brick = brick;
    }
    update(dt) {
        if (this._timer > 0) {
            this._timer -= dt;
        }
        let gamepads = navigator.getGamepads();
        let gamepad = gamepads[0];
        if (gamepad) {
            let axis1 = -Nabu.InputManager.DeadZoneAxis(gamepad.axes[1]);
            if (axis1 > 0.5) {
                if (this._timer <= 0) {
                    this.currentPointerUp();
                    this._timer = 0.5;
                }
            }
            else if (axis1 < -0.5) {
                if (this._timer <= 0) {
                    this.currentPointerDown();
                    this._timer = 0.5;
                }
            }
            else {
                this._timer = 0;
            }
        }
    }
}
customElements.define("brick-menu", BrickMenuView);
class PlayerActionManager {
    constructor(player, game) {
        this.player = player;
        this.game = game;
        this.alwaysEquip = true;
        this.linkedActions = [];
        this.currentActionIndex = -1;
        this.update = () => {
        };
        player.playerActionManager = this;
    }
    get playerActionView() {
        return this.game.playerActionView;
    }
    prevActionIndex() {
        if (this.currentActionIndex === 1) {
            return -1;
        }
        if (this.currentActionIndex === 0) {
            return 9;
        }
        if (this.currentActionIndex === 10) {
            return 0;
        }
        return this.currentActionIndex - 1;
    }
    nextActionIndex() {
        if (this.currentActionIndex === -1) {
            return 1;
        }
        if (this.currentActionIndex === 9) {
            return 0;
        }
        if (this.currentActionIndex === 0) {
            return 10;
        }
        return this.currentActionIndex + 1;
    }
    initialize() {
        let savedPlayerActionString = window.localStorage.getItem("player-action-manager");
        if (savedPlayerActionString) {
            let savedPlayerAction = JSON.parse(savedPlayerActionString);
            this.deserializeInPlace(savedPlayerAction);
        }
        this.game.scene.onBeforeRenderObservable.add(this.update);
    }
    linkAction(action, slotIndex) {
        this.unlinkAction(slotIndex);
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = action;
            this.playerActionView.onActionLinked(action, slotIndex);
            this.saveToLocalStorage();
        }
    }
    unlinkAction(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = undefined;
            this.playerActionView.onActionUnlinked(slotIndex);
            this.saveToLocalStorage();
        }
    }
    setActionIndex(slotIndex) {
        this.playerActionView.unlight(this.currentActionIndex);
        this.currentActionIndex = Nabu.MinMax(slotIndex, -1, 10);
        if (this.alwaysEquip || this.player.currentAction) {
            this.unEquipAction();
            this.equipAction();
        }
        this.playerActionView.highlight(this.currentActionIndex);
    }
    toggleEquipAction() {
        if (this.player.currentAction) {
            this.unEquipAction();
        }
        else {
            this.equipAction();
        }
    }
    equipAction() {
        console.log("test");
        this.player.currentAction = this.linkedActions[this.currentActionIndex];
        if (this.player.currentAction) {
            this.playerActionView.onActionEquiped(this.currentActionIndex);
        }
        else {
            this.playerActionView.onActionEquiped(-1);
        }
    }
    unEquipAction() {
        if (this.player.currentAction) {
            this.player.currentAction = undefined;
            this.playerActionView.onActionEquiped(-1);
        }
    }
    saveToLocalStorage() {
        let data = this.serialize();
        window.localStorage.setItem("player-action-manager", JSON.stringify(data));
    }
    loadFromLocalStorage() {
        let dataString = window.localStorage.getItem("player-action-manager");
        if (dataString) {
            let data = JSON.parse(dataString);
            this.deserializeInPlace(data);
        }
    }
    serialize() {
        let linkedActionsNames = [];
        for (let i = 0; i < this.linkedActions.length; i++) {
            if (this.linkedActions[i]) {
                linkedActionsNames[i] = this.linkedActions[i].name;
            }
            else {
                linkedActionsNames[i] = undefined;
            }
        }
        return {
            linkedItemNames: linkedActionsNames
        };
    }
    async deserializeInPlace(data) {
        if (data && data.linkedItemNames) {
            for (let i = 0; i < data.linkedItemNames.length; i++) {
                let linkedItemName = data.linkedItemNames[i];
                if (linkedItemName) {
                    if (linkedItemName.startsWith("paint_")) {
                        let paintName = linkedItemName.replace("paint_", "");
                        let paintIndex = DodoColors.findIndex(c => { return c.name === paintName; });
                        this.linkAction(PlayerActionTemplate.CreatePaintAction(this.player, paintIndex), i);
                    }
                    else if (linkedItemName) {
                        this.linkAction(await PlayerActionTemplate.CreateBrickAction(this.player, linkedItemName), i);
                    }
                }
            }
        }
    }
}
class PlayerActionView {
    constructor() {
        this._tiles = [];
    }
    getTile(slotIndex) {
        if (slotIndex < 0 || slotIndex > 9) {
            return undefined;
        }
        if (!this._tiles[slotIndex]) {
            this._tiles[slotIndex] = document.querySelector("#action-" + slotIndex.toFixed(0));
        }
        return this._tiles[slotIndex];
    }
    initialize(player) {
        this.player = player;
        for (let i = 0; i <= 9; i++) {
            let slotIndex = i;
            let tile = this.getTile(i);
            tile.onclick = () => {
                if (this.player.playerActionManager) {
                    if (slotIndex === this.player.playerActionManager.currentActionIndex) {
                        this.player.playerActionManager.toggleEquipAction();
                    }
                    else {
                        this.player.playerActionManager.setActionIndex(slotIndex);
                        this.player.playerActionManager.equipAction();
                    }
                }
            };
        }
    }
    highlight(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            let tile = this.getTile(slotIndex);
            if (tile) {
                tile.classList.add("highlit");
            }
        }
    }
    unlight(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            let tile = this.getTile(slotIndex);
            if (tile) {
                tile.classList.remove("highlit");
            }
        }
    }
    equip(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            let tile = this.getTile(slotIndex);
            if (tile) {
                tile.classList.add("equiped");
            }
        }
    }
    unEquip(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            let tile = this.getTile(slotIndex);
            if (tile) {
                tile.classList.remove("equiped");
            }
        }
    }
    onActionEquiped(slotIndex) {
        for (let i = 0; i <= 9; i++) {
            this.unEquip(i);
        }
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.equip(slotIndex);
        }
    }
    onHintStart(slotIndex) {
    }
    onHintEnd(slotIndex) {
    }
    onActionLinked(action, slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            let tile = this.getTile(slotIndex);
            if (tile) {
                if (action.iconUrl) {
                    tile.style.background = "url(" + action.iconUrl + ")";
                    tile.style.backgroundSize = "contain";
                    tile.style.backgroundRepeat = "no-repeat";
                    tile.style.backgroundPosition = "center";
                    tile.style.backgroundColor = action.backgroundColor;
                }
                else {
                    tile.style.background = undefined;
                    tile.style.backgroundColor = action.backgroundColor;
                }
                action._onIconUrlChanged = () => {
                    tile.style.background = "url(" + action.iconUrl + ")";
                    tile.style.backgroundSize = "contain";
                    tile.style.backgroundRepeat = "no-repeat";
                    tile.style.backgroundPosition = "center";
                    tile.style.backgroundColor = action.backgroundColor;
                };
            }
        }
    }
    onActionUnlinked(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            let tile = this.getTile(slotIndex);
            if (tile) {
                tile.style.background = undefined;
                tile.style.backgroundColor = undefined;
            }
        }
    }
}
class PlayerAction {
    constructor(name, player) {
        this.name = name;
        this.player = player;
        this.backgroundColor = "#ffffff";
        this.r = 0;
    }
    get iconUrl() {
        return this._iconUrl;
    }
    set iconUrl(url) {
        this._iconUrl = url;
        if (this._onIconUrlChanged) {
            this._onIconUrlChanged();
        }
    }
}
var InventoryCategory;
(function (InventoryCategory) {
    InventoryCategory[InventoryCategory["Brick"] = 0] = "Brick";
    InventoryCategory[InventoryCategory["Paint"] = 1] = "Paint";
    InventoryCategory[InventoryCategory["Ingredient"] = 2] = "Ingredient";
    InventoryCategory[InventoryCategory["End"] = 3] = "End";
})(InventoryCategory || (InventoryCategory = {}));
class PlayerInventoryItem {
    constructor(name, category, game) {
        this.count = 1;
        this.getIcon = async () => { return ""; };
        this.name = name;
        this.category = category;
        if (this.category === InventoryCategory.Brick) {
            this.getIcon = async () => {
                return game.miniatureFactory.makeBrickIconString(name);
            };
        }
        if (this.category === InventoryCategory.Paint) {
            this.getIcon = async () => {
                return game.miniatureFactory.makePaintIconString(name);
            };
        }
    }
    async getPlayerAction(player) {
        if (this.category === InventoryCategory.Brick) {
            return await PlayerActionTemplate.CreateBrickAction(player, this.name);
        }
        else if (this.category === InventoryCategory.Paint) {
            let colorIndex = DodoColors.findIndex(c => { return c.name === this.name; });
            if (colorIndex >= 0) {
                return PlayerActionTemplate.CreatePaintAction(player, colorIndex);
            }
        }
    }
}
class PlayerInventory {
    constructor(player) {
        this.player = player;
        this.items = [];
    }
    addItem(item) {
        let existingItem = this.items.find(it => { return it.name === item.name; });
        if (existingItem) {
            existingItem.count += item.count;
        }
        else {
            this.items.push(item);
        }
    }
}
class PlayerInventoryLine extends HTMLDivElement {
    constructor() {
        super();
    }
}
customElements.define("inventory-line", PlayerInventoryLine, { extends: "div" });
class PlayerInventoryView extends HTMLElement {
    constructor() {
        super(...arguments);
        this._loaded = false;
        this._shown = false;
        this.currentPointers = [0, 0, 0];
        this._currentCategory = InventoryCategory.Brick;
        this._timer = 0;
    }
    static get observedAttributes() {
        return [];
    }
    get loaded() {
        return this._loaded;
    }
    waitLoaded() {
        return new Promise(resolve => {
            let step = () => {
                if (this.loaded) {
                    resolve();
                }
                else {
                    requestAnimationFrame(step);
                }
            };
            step();
        });
    }
    get shown() {
        return this._shown;
    }
    get onLoad() {
        return this._onLoad;
    }
    set onLoad(callback) {
        this._onLoad = callback;
        if (this._loaded) {
            this._onLoad();
        }
    }
    currentPointerUp() {
        if (this._lines[this._currentCategory].length > 0) {
            this.setPointer((this.currentPointers[this._currentCategory] - 1 + this._lines[this._currentCategory].length) % this._lines[this._currentCategory].length);
        }
    }
    currentPointerDown() {
        if (this._lines[this._currentCategory].length > 0) {
            this.setPointer((this.currentPointers[this._currentCategory] + 1) % this._lines[this._currentCategory].length);
        }
    }
    setPointer(n, cat) {
        if (!isFinite(cat)) {
            cat = this._currentCategory;
        }
        if (this._lines[cat][this.currentPointers[cat]]) {
            this._lines[cat][this.currentPointers[cat]].classList.remove("highlit");
        }
        this.currentPointers[cat] = n;
        if (this._lines[cat][this.currentPointers[cat]]) {
            this._lines[cat][this.currentPointers[cat]].classList.add("highlit");
        }
    }
    setCurrentCategory(cat) {
        this._currentCategory = cat;
        for (let i = 0; i < this._categoryBtns.length; i++) {
            this._categoryBtns[i].classList.remove("active");
            this._containers[i].style.display = "none";
        }
        this._categoryBtns[this._currentCategory].classList.add("active");
        this._containers[this._currentCategory].style.display = "block";
    }
    getCurrentItem() {
        if (this._lines[this._currentCategory]) {
            if (this._lines[this._currentCategory][this.currentPointers[this._currentCategory]]) {
                return this._lines[this._currentCategory][this.currentPointers[this._currentCategory]].item;
            }
        }
    }
    get prevCategory() {
        return (this._currentCategory - 1 + InventoryCategory.End) % InventoryCategory.End;
    }
    get nextCategory() {
        return (this._currentCategory + 1) % InventoryCategory.End;
    }
    connectedCallback() {
        this.style.display = "none";
        this.style.opacity = "0";
        this._title = document.createElement("h1");
        this._title.classList.add("inventory-page-title");
        this._title.innerHTML = "INVENTORY";
        this.appendChild(this._title);
        let categoriesContainer;
        categoriesContainer = document.createElement("div");
        this.appendChild(categoriesContainer);
        this._categoryBricksBtn = document.createElement("div");
        this._categoryBricksBtn.classList.add("category-btn");
        this._categoryBricksBtn.innerHTML = "BRICKS";
        categoriesContainer.appendChild(this._categoryBricksBtn);
        this._categoryBricksBtn.onclick = () => {
            this.setCurrentCategory(InventoryCategory.Brick);
        };
        this._categoryPaintsBtn = document.createElement("div");
        this._categoryPaintsBtn.classList.add("category-btn");
        this._categoryPaintsBtn.innerHTML = "PAINTS";
        categoriesContainer.appendChild(this._categoryPaintsBtn);
        this._categoryPaintsBtn.onclick = () => {
            this.setCurrentCategory(InventoryCategory.Paint);
        };
        this._categoryIngredientsBtn = document.createElement("div");
        this._categoryIngredientsBtn.classList.add("category-btn");
        this._categoryIngredientsBtn.innerHTML = "INGREDIENTS";
        categoriesContainer.appendChild(this._categoryIngredientsBtn);
        this._categoryIngredientsBtn.onclick = () => {
            this.setCurrentCategory(InventoryCategory.Ingredient);
        };
        this._categoryBtns = [
            this._categoryBricksBtn,
            this._categoryPaintsBtn,
            this._categoryIngredientsBtn,
        ];
        this._containerFrame = document.createElement("div");
        this._containerFrame.classList.add("container-frame");
        this.appendChild(this._containerFrame);
        this._containers = [];
        for (let i = 0; i < InventoryCategory.End; i++) {
            this._containers[i] = document.createElement("div");
            this._containers[i].classList.add("container");
            this._containerFrame.appendChild(this._containers[i]);
        }
        let a = document.createElement("a");
        a.href = "#home";
        this.appendChild(a);
        this.setCurrentCategory(InventoryCategory.Brick);
        this.exterior = document.createElement("div");
        this.exterior.classList.add("inventory-exterior");
        this.exterior.style.display = "none";
        this.parentElement.appendChild(this.exterior);
        this.exterior.onclick = () => {
            this.hide();
        };
    }
    attributeChangedCallback(name, oldValue, newValue) { }
    async show(duration = 0.2) {
        this.createPage();
        return new Promise((resolve) => {
            if (!this._shown) {
                this._shown = true;
                this.exterior.style.display = "block";
                this.style.display = "block";
                let opacity0 = parseFloat(this.style.opacity);
                let opacity1 = 1;
                let t0 = performance.now();
                let step = () => {
                    let t = performance.now();
                    let dt = (t - t0) / 1000;
                    if (dt >= duration) {
                        this.style.opacity = "1";
                        resolve();
                    }
                    else {
                        let f = dt / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                        requestAnimationFrame(step);
                    }
                };
                step();
            }
        });
    }
    async hide(duration = 0.2) {
        if (duration === 0) {
            this._shown = false;
            this.exterior.style.display = "none";
            this.style.display = "none";
            this.style.opacity = "0";
        }
        else {
            return new Promise((resolve) => {
                if (this._shown) {
                    this._shown = false;
                    this.exterior.style.display = "none";
                    this.style.display = "block";
                    let opacity0 = parseFloat(this.style.opacity);
                    let opacity1 = 0;
                    let t0 = performance.now();
                    let step = () => {
                        let t = performance.now();
                        let dt = (t - t0) / 1000;
                        if (dt >= duration) {
                            this.style.display = "none";
                            this.style.opacity = "0";
                            if (this.onNextHide) {
                                this.onNextHide();
                                this.onNextHide = undefined;
                            }
                            resolve();
                        }
                        else {
                            let f = dt / duration;
                            this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                            requestAnimationFrame(step);
                        }
                    };
                    step();
                }
            });
        }
    }
    setInventory(inventory) {
        this.inventory = inventory;
    }
    async createPage() {
        this._lines = [];
        for (let i = 0; i < this._containers.length; i++) {
            this._containers[i].innerHTML = "";
            this._lines[i] = [];
        }
        for (let i = 0; i < this.inventory.items.length; i++) {
            let inventoryItem = this.inventory.items[i];
            let line = document.createElement("div");
            line.setAttribute("is", "inventory-line");
            line.item = inventoryItem;
            line.classList.add("line");
            this._containers[inventoryItem.category].appendChild(line);
            this._lines[inventoryItem.category].push(line);
            let icon = document.createElement("img");
            icon.classList.add("inventory-icon");
            icon.setAttribute("src", await inventoryItem.getIcon());
            line.appendChild(icon);
            let label = document.createElement("div");
            label.classList.add("label");
            label.innerHTML = inventoryItem.name;
            line.appendChild(label);
            let countBlock = document.createElement("div");
            countBlock.classList.add("count-block");
            countBlock.innerHTML = inventoryItem.count.toFixed(0);
            line.appendChild(countBlock);
            let equipButton = document.createElement("button");
            equipButton.classList.add("equip-button");
            equipButton.innerHTML = "EQUIP";
            line.appendChild(equipButton);
            equipButton.onclick = async () => {
                let action = await inventoryItem.getPlayerAction(this.inventory.player);
                this.inventory.player.playerActionManager.linkAction(action, this.inventory.player.playerActionManager.currentActionIndex);
                if (this.inventory.player.playerActionManager.alwaysEquip) {
                    this.inventory.player.playerActionManager.equipAction();
                }
            };
        }
        this.setPointer(0, InventoryCategory.Brick);
        this.setPointer(0, InventoryCategory.Ingredient);
    }
    update(dt) {
        if (this._timer > 0) {
            this._timer -= dt;
        }
        let gamepads = navigator.getGamepads();
        let gamepad = gamepads[0];
        if (gamepad) {
            let axis1 = -Nabu.InputManager.DeadZoneAxis(gamepad.axes[1]);
            if (axis1 > 0.5) {
                if (this._timer <= 0) {
                    this.currentPointerUp();
                    this._timer = 0.5;
                }
            }
            else if (axis1 < -0.5) {
                if (this._timer <= 0) {
                    this.currentPointerDown();
                    this._timer = 0.5;
                }
            }
            else {
                this._timer = 0;
            }
        }
    }
}
customElements.define("inventory-page", PlayerInventoryView);
function SavePlayerToLocalStorage(game) {
    if (!game.gameLoaded) {
        return;
    }
    let data = {
        name: "NoName",
        claimedConstructionI: null,
        claimedConstructionJ: null,
        token: "",
        style: ""
    };
    data.name = game.playerDodo.name;
    data.claimedConstructionI = game.networkManager.claimedConstructionI;
    data.claimedConstructionJ = game.networkManager.claimedConstructionJ;
    data.token = game.networkManager.token;
    data.style = game.playerDodo.style;
    if (HasLocalStorage) {
        window.localStorage.setItem("player-save", JSON.stringify(data));
    }
}
function LoadPlayerFromLocalStorage(game) {
    if (HasLocalStorage) {
        let dataString = window.localStorage.getItem("player-save");
        if (dataString) {
            let data = JSON.parse(dataString);
            if (data) {
                if (data.name) {
                    game.playerDodo.name = data.name;
                }
                if (data.claimedConstructionI != null) {
                    game.networkManager.claimedConstructionI = data.claimedConstructionI;
                }
                if (data.claimedConstructionJ != null) {
                    game.networkManager.claimedConstructionJ = data.claimedConstructionJ;
                }
                if (data.token) {
                    game.networkManager.token = data.token;
                }
                if (data.style) {
                    game.playerDodo.setStyle(data.style);
                }
            }
        }
    }
}
function SavePlayerPositionToLocalStorage(game) {
    if (!game.gameLoaded) {
        return;
    }
    if (game.gameMode === GameMode.Playing) {
        let data = {
            posX: undefined,
            posY: undefined,
            posZ: undefined,
            rot: undefined
        };
        data.posX = game.playerDodo.position.x;
        data.posY = game.playerDodo.position.y;
        data.posZ = game.playerDodo.position.z;
        data.rot = game.playerDodo.r;
        if (isFinite(data.posX * data.posY * data.posZ) && isFinite(data.rot)) {
            if (HasLocalStorage) {
                window.localStorage.setItem("player-save-position", JSON.stringify(data));
            }
        }
    }
}
function LoadPlayerPositionFromLocalStorage(game) {
    if (HasLocalStorage) {
        let dataString = window.localStorage.getItem("player-save-position");
        if (dataString) {
            let data = JSON.parse(dataString);
            if (data) {
                if (isFinite(data.posX * data.posY * data.posZ) && isFinite(data.rot)) {
                    game.playerDodo.setWorldPosition(new BABYLON.Vector3(data.posX, data.posY, data.posZ));
                    game.playerDodo.r = data.rot;
                    return true;
                }
            }
        }
    }
    return false;
}
class PlayerActionDefault {
    static IsAimable(mesh) {
        if (mesh instanceof ConstructionMesh) {
            return true;
        }
        if (mesh instanceof DodoCollider) {
            return true;
        }
        return false;
    }
    static Create(player) {
        let actionRange = 4;
        let actionRangeSquared = actionRange * actionRange;
        let defaultAction = new PlayerAction("default-action", player);
        defaultAction.backgroundColor = "#FF00FF";
        defaultAction.iconUrl = "";
        let aimedObject;
        let setAimedObject = (b) => {
            if (b != aimedObject) {
                ScreenLoger.Log("setAimedObject " + (b != undefined ? b.name : "undefined"));
                if (aimedObject) {
                    aimedObject.unlit();
                }
                aimedObject = b;
                if (aimedObject) {
                    aimedObject.highlight();
                }
            }
        };
        defaultAction.onUpdate = () => {
            if (player.playMode === PlayMode.Playing) {
                let x;
                let y;
                if (player.gamepadInControl || player.game.inputManager.isPointerLocked) {
                    x = player.game.canvas.clientWidth * 0.5;
                    y = player.game.canvas.clientHeight * 0.5;
                }
                else {
                    x = player.scene.pointerX;
                    y = player.scene.pointerY;
                }
                let hit = player.game.scene.pick(x, y, (mesh) => {
                    return PlayerActionDefault.IsAimable(mesh) && mesh != player.dodo.dodoCollider;
                });
                if (hit.hit && hit.pickedPoint) {
                    if (BABYLON.Vector3.DistanceSquared(player.dodo.position, hit.pickedPoint) < actionRangeSquared) {
                        if (hit.pickedMesh instanceof ConstructionMesh) {
                            let construction = hit.pickedMesh.construction;
                            if (construction) {
                                let brick = construction.getBrickForFaceId(hit.faceId);
                                if (brick) {
                                    setAimedObject(brick);
                                }
                                return;
                            }
                        }
                        else if (hit.pickedMesh instanceof DodoCollider) {
                            setAimedObject(hit.pickedMesh);
                            return;
                        }
                    }
                }
            }
            setAimedObject(undefined);
        };
        defaultAction.onPointerUp = async (duration, onScreenDistance) => {
            if (onScreenDistance > 4) {
                return;
            }
            if (duration > 0.3) {
                if (aimedObject instanceof Brick) {
                    player.game.brickMenuView.setBrick(aimedObject);
                    if (player.game.inputManager.isPointerLocked) {
                        document.exitPointerLock();
                        player.game.brickMenuView.onNextHide = () => {
                            player.game.canvas.requestPointerLock();
                        };
                    }
                    player.game.brickMenuView.show(0.1);
                }
            }
            else {
                if (player.playMode === PlayMode.Playing) {
                    if (aimedObject instanceof Brick) {
                        let construction = aimedObject.construction;
                        let brickId = aimedObject.index;
                        let brickColorIndex = aimedObject.colorIndex;
                        let r = aimedObject.r;
                        aimedObject.dispose();
                        construction.updateMesh();
                        player.currentAction = await PlayerActionTemplate.CreateBrickAction(player, brickId, brickColorIndex, r, true);
                    }
                    else if (aimedObject instanceof DodoCollider) {
                        if (aimedObject.dodo.brain.npcDialog) {
                            let canvas = aimedObject.dodo.game.canvas;
                            document.exitPointerLock();
                            aimedObject.dodo.brain.npcDialog.onNextStop = () => {
                                canvas.requestPointerLock();
                            };
                            aimedObject.dodo.brain.npcDialog.start();
                        }
                    }
                }
            }
        };
        defaultAction.onRightPointerUp = (duration, onScreenDistance) => {
            if (onScreenDistance > 4) {
                return;
            }
            if (aimedObject instanceof Brick) {
                let prevParent = aimedObject.parent;
                if (prevParent instanceof Brick) {
                    aimedObject.setParent(undefined);
                }
            }
        };
        defaultAction.onUnequip = () => {
            setAimedObject(undefined);
        };
        return defaultAction;
    }
}
class PlayerActionMoveBrick {
    static Create(player, brick) {
        ScreenLoger.Log("PlayerActionMoveBrick.Create");
        let brickAction = new PlayerAction("move-brick-action", player);
        brickAction.backgroundColor = "#FF00FF";
        brickAction.iconUrl = "";
        let initPos = brick.position.clone();
        brickAction.onUpdate = () => {
            let terrain = player.game.terrain;
            if (player.playMode === PlayMode.Playing) {
                let x;
                let y;
                if (player.gamepadInControl || player.game.inputManager.isPointerLocked) {
                    x = player.game.canvas.clientWidth * 0.5;
                    y = player.game.canvas.clientHeight * 0.5;
                }
                else {
                    x = player.scene.pointerX;
                    y = player.scene.pointerY;
                }
                let hit = player.game.scene.pick(x, y, (mesh) => {
                    return (mesh instanceof ConstructionMesh) || mesh instanceof Chunck;
                });
                if (hit && hit.pickedPoint) {
                    let n = hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    let pos = hit.pickedPoint.add(n).subtract(brick.construction.position);
                    brick.posI = Math.round(pos.x / BRICK_S);
                    brick.posK = Math.floor(pos.y / BRICK_H);
                    brick.posJ = Math.round(pos.z / BRICK_S);
                    brick.clampToConstruction();
                    brick.construction.updateMesh();
                }
            }
        };
        brickAction.onPointerUp = (duration) => {
            console.log("onPointerUp");
            let terrain = player.game.terrain;
            if (player.playMode === PlayMode.Playing) {
                let x;
                let y;
                if (player.gamepadInControl || player.game.inputManager.isPointerLocked) {
                    x = player.game.canvas.clientWidth * 0.5;
                    y = player.game.canvas.clientHeight * 0.5;
                }
                else {
                    x = player.scene.pointerX;
                    y = player.scene.pointerY;
                }
                let hit = player.game.scene.pick(x, y, (mesh) => {
                    return (mesh instanceof ConstructionMesh) || mesh instanceof Chunck;
                });
                if (hit && hit.pickedPoint) {
                    /*
                    let n =  hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    if (hit.pickedMesh instanceof ConstructionMesh) {
                        if (duration > 0.3) {
                            let root = hit.pickedMesh.brick.root;
                            let aimedBrick = root.getBrickForFaceId(hit.faceId);
                            brick.setParent(aimedBrick);
                            brick.clampToConstruction();
                            brick.updateMesh();
                        }
                        else {
                            let pos = hit.pickedPoint.add(n).subtractInPlace(brick.construction.position);
                            brick.posI = Math.round(pos.x / BRICK_S);
                            brick.posJ = Math.round(pos.z / BRICK_S);
                            brick.posK = Math.floor(pos.y / BRICK_H);
                            brick.setParent(undefined);
                            brick.clampToConstruction();
                            brick.updateMesh();
                            brick.updateRootPosition();

                            brick.construction.saveToLocalStorage();
                            brick.construction.saveToServer();
                        }
                    }
                    else {
                        let pos = hit.pickedPoint.add(n).subtractInPlace(brick.construction.position);
                        brick.posI = Math.round(pos.x / BRICK_S);
                        brick.posJ = Math.round(pos.z / BRICK_S);
                        brick.posK = Math.floor(pos.y / BRICK_H);
                        brick.setParent(undefined);
                        brick.clampToConstruction();
                        brick.updateMesh();
                        brick.updateRootPosition();

                        brick.construction.saveToLocalStorage();
                        brick.construction.saveToServer();
                    }
                    */
                }
            }
            player.currentAction = undefined;
        };
        let rotateBrick = () => {
            if (brick) {
                brick.r = (brick.r + 1) % 4;
            }
        };
        let deleteBrick = () => {
            if (brick) {
                brick.dispose();
                player.currentAction = undefined;
            }
        };
        brickAction.onEquip = () => {
            player.game.inputManager.addMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick);
            player.game.inputManager.addMappedKeyDownListener(KeyInput.DELETE_SELECTED, deleteBrick);
        };
        brickAction.onUnequip = () => {
            player.game.inputManager.removeMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick);
            player.game.inputManager.removeMappedKeyDownListener(KeyInput.DELETE_SELECTED, deleteBrick);
        };
        brickAction.onWheel = (e) => {
            /*
            if (brick.isRoot && brick.getChildTransformNodes().length === 0) {
                if (e.deltaY > 0) {
                    brick.index = (brick.index + BRICK_LIST.length - 1) % BRICK_LIST.length;
                    brick.updateMesh();
                }
                else if (e.deltaY < 0) {
                    brick.index = (brick.index + 1) % BRICK_LIST.length;
                    brick.updateMesh();
                }
            }
            */
        };
        return brickAction;
    }
}
var ACTIVE_DEBUG_PLAYER_ACTION = true;
var ADD_BRICK_ANIMATION_DURATION = 1000;
class PlayerActionTemplate {
    static async CreateBrickAction(player, brickId, colorIndex, r = 0, onlyOnce) {
        let brickIndex = Brick.BrickIdToIndex(brickId);
        let brickAction = new PlayerAction(Brick.BrickIdToName(brickId), player);
        brickAction.backgroundColor = "#000000";
        let previewMesh;
        //brickAction.iconUrl = "/datas/icons/bricks/" + Brick.BrickIdToName(brickId) + ".png";
        brickAction.iconUrl = await player.game.miniatureFactory.makeBrickIconString(brickId);
        brickAction.onUpdate = () => {
            let terrain = player.game.terrain;
            if (player.playMode === PlayMode.Playing) {
                let x;
                let y;
                if (player.gamepadInControl || player.game.inputManager.isPointerLocked) {
                    x = player.game.canvas.clientWidth * 0.5;
                    y = player.game.canvas.clientHeight * 0.5;
                }
                else {
                    x = player.scene.pointerX;
                    y = player.scene.pointerY;
                }
                let hit = player.game.scene.pick(x, y, (mesh) => {
                    return mesh instanceof Chunck || mesh instanceof ConstructionMesh;
                });
                if (hit && hit.pickedPoint) {
                    let n = hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    let pos = hit.pickedPoint.add(n);
                    pos.x = BRICK_S * Math.round(pos.x / BRICK_S);
                    pos.y = BRICK_H * Math.floor(pos.y / BRICK_H);
                    pos.z = BRICK_S * Math.round(pos.z / BRICK_S);
                    previewMesh.position.copyFrom(pos);
                    previewMesh.rotation.y = Math.PI * 0.5 * r;
                    previewMesh.isVisible = true;
                    return;
                }
            }
            if (previewMesh) {
                previewMesh.isVisible = false;
            }
        };
        brickAction.onPointerUp = () => {
            if (player.playMode === PlayMode.Playing) {
                let x;
                let y;
                if (player.gamepadInControl || player.game.inputManager.isPointerLocked) {
                    x = player.game.canvas.clientWidth * 0.5;
                    y = player.game.canvas.clientHeight * 0.5;
                }
                else {
                    x = player.scene.pointerX;
                    y = player.scene.pointerY;
                }
                let hit = player.game.scene.pick(x, y, (mesh) => {
                    return mesh instanceof Chunck || mesh instanceof ConstructionMesh;
                });
                if (hit && hit.pickedPoint) {
                    let n = hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    let constructionIJ = Construction.worldPosToIJ(hit.pickedPoint);
                    let construction = player.game.terrainManager.getOrCreateConstruction(constructionIJ.i, constructionIJ.j);
                    if (construction && construction.isPlayerAllowedToEdit()) {
                        let brick = new Brick(brickIndex, isFinite(colorIndex) ? colorIndex : 0, construction);
                        let pos = hit.pickedPoint.add(n).subtractInPlace(construction.position);
                        brick.posI = Math.round(pos.x / BRICK_S);
                        brick.posJ = Math.round(pos.z / BRICK_S);
                        brick.posK = Math.floor(pos.y / BRICK_H);
                        brick.r = r;
                        ScreenLoger.Log(brick.posI + " " + brick.posJ + " " + brick.posK);
                        construction.updateMesh();
                        construction.saveToLocalStorage();
                        construction.saveToServer();
                    }
                }
            }
            if (onlyOnce) {
                player.currentAction = undefined;
            }
        };
        let rotateBrick = () => {
            r = (r + 1) % 4;
        };
        brickAction.onEquip = () => {
            brickIndex = Brick.BrickIdToIndex(brickId);
            if (!previewMesh || previewMesh.isDisposed()) {
                previewMesh = new BABYLON.Mesh("brick-preview-mesh");
            }
            let previewMat = new BABYLON.StandardMaterial("brick-preview-material");
            previewMat.alpha = 0.5;
            previewMat.specularColor.copyFromFloats(1, 1, 1);
            previewMesh.material = previewMat;
            previewMesh.rotation.y = Math.PI * 0.5;
            BrickTemplateManager.Instance.getTemplate(brickIndex).then(template => {
                template.vertexData.applyToMesh(previewMesh);
            });
            player.game.inputManager.addMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick);
        };
        brickAction.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
            }
            player.game.inputManager.removeMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick);
        };
        brickAction.onWheel = (e) => {
            if (e.deltaY > 0) {
                brickIndex = (brickIndex + BRICK_LIST.length - 1) % BRICK_LIST.length;
                BrickTemplateManager.Instance.getTemplate(brickIndex).then(template => {
                    if (previewMesh && !previewMesh.isDisposed()) {
                        template.vertexData.applyToMesh(previewMesh);
                    }
                });
            }
            else if (e.deltaY < 0) {
                brickIndex = (brickIndex + 1) % BRICK_LIST.length;
                BrickTemplateManager.Instance.getTemplate(brickIndex).then(template => {
                    if (previewMesh && !previewMesh.isDisposed()) {
                        template.vertexData.applyToMesh(previewMesh);
                    }
                });
            }
        };
        return brickAction;
    }
    static CreatePaintAction(player, paintIndex) {
        let paintAction = new PlayerAction("paint_" + DodoColors[paintIndex].name, player);
        paintAction.backgroundColor = DodoColors[paintIndex].hex;
        paintAction.iconUrl = "/datas/icons/paintbrush.svg";
        let brush;
        let tip;
        paintAction.onUpdate = () => {
        };
        paintAction.onPointerDown = () => {
            if (player.playMode === PlayMode.Playing) {
                let x;
                let y;
                if (player.gamepadInControl || player.game.inputManager.isPointerLocked) {
                    x = player.game.canvas.clientWidth * 0.5;
                    y = player.game.canvas.clientHeight * 0.5;
                }
                else {
                    x = player.scene.pointerX;
                    y = player.scene.pointerY;
                }
                let hit = player.game.scene.pick(x, y, (mesh) => {
                    return mesh instanceof ConstructionMesh;
                });
                if (hit && hit.pickedPoint) {
                    if (hit.pickedMesh instanceof ConstructionMesh) {
                        let construction = hit.pickedMesh.construction;
                        let aimedBrick = construction.getBrickForFaceId(hit.faceId);
                        aimedBrick.colorIndex = paintIndex;
                        //player.lastUsedPaintIndex = paintIndex;
                        construction.updateMesh();
                        construction.saveToLocalStorage();
                        construction.saveToServer();
                    }
                }
            }
        };
        paintAction.onEquip = async () => {
            brush = new BABYLON.Mesh("brush");
            brush.parent = player.dodo;
            brush.position.z = 0.8;
            brush.position.x = 0.1;
            brush.position.y = -0.2;
            tip = new BABYLON.Mesh("tip");
            tip.parent = brush;
            let tipMaterial = new BABYLON.StandardMaterial("tip-material");
            tipMaterial.diffuseColor = BABYLON.Color3.FromHexString(DodoColors[paintIndex].hex);
            tip.material = tipMaterial;
            //let vDatas = await player.game.vertexDataLoader.get("./datas/meshes/paintbrush.babylon");
            if (brush && !brush.isDisposed()) {
                //vDatas[0].applyToMesh(brush);
                //vDatas[1].applyToMesh(tip);
            }
        };
        paintAction.onUnequip = () => {
            if (brush) {
                brush.dispose();
            }
        };
        paintAction.onWheel = (e) => {
            if (e.deltaY > 0) {
                paintIndex = (paintIndex + DodoColors.length - 1) % DodoColors.length;
                if (tip && !tip.isDisposed() && tip.material instanceof BABYLON.StandardMaterial) {
                    tip.material.diffuseColor = BABYLON.Color3.FromHexString(DodoColors[paintIndex].hex);
                }
            }
            else if (e.deltaY < 0) {
                paintIndex = (paintIndex + 1) % DodoColors.length;
                if (tip && !tip.isDisposed() && tip.material instanceof BABYLON.StandardMaterial) {
                    tip.material.diffuseColor = BABYLON.Color3.FromHexString(DodoColors[paintIndex].hex);
                }
            }
        };
        return paintAction;
    }
}
class ConstructionMesh extends BABYLON.Mesh {
    constructor(construction) {
        super("construction-mesh", construction.terrain.game.scene);
        this.construction = construction;
    }
}
class Brick extends BABYLON.TransformNode {
    constructor(arg1, colorIndex, construction) {
        super("brick");
        this.colorIndex = colorIndex;
        this.index = Brick.BrickIdToIndex(arg1);
        if (construction) {
            this.construction = construction;
            this.construction.bricks.push(this);
            this.parent = this.construction;
        }
    }
    get brickName() {
        return BRICK_LIST[this.index];
    }
    static BrickIdToIndex(brickID) {
        if (typeof (brickID) === "number") {
            return brickID;
        }
        else {
            return BRICK_LIST.indexOf(brickID);
        }
    }
    static BrickIdToName(brickID) {
        if (typeof (brickID) === "string") {
            return brickID;
        }
        else {
            return BRICK_LIST[brickID];
        }
    }
    get posI() {
        return Math.round(this.position.x / BRICK_S);
    }
    set posI(v) {
        this.position.x = v * BRICK_S;
    }
    get posJ() {
        return Math.round(this.position.z / BRICK_S);
    }
    set posJ(v) {
        this.position.z = v * BRICK_S;
    }
    get posK() {
        return Math.round(this.position.y / BRICK_H);
    }
    set posK(v) {
        this.position.y = v * BRICK_H;
    }
    clampToConstruction() {
        let posInConstruction = this.absolutePosition.subtract(this.construction.position);
        let iInConstruction = Math.round(posInConstruction.x / BRICK_S);
        let jInConstruction = Math.round(posInConstruction.z / BRICK_S);
        let overshoot = new BABYLON.Vector3(0, 0, 0);
        if (iInConstruction < 0) {
            overshoot.x = iInConstruction;
        }
        else if (iInConstruction >= BRICKS_PER_CONSTRUCTION) {
            overshoot.x = iInConstruction - (BRICKS_PER_CONSTRUCTION - 1);
        }
        if (jInConstruction < 0) {
            overshoot.z = jInConstruction;
        }
        else if (jInConstruction >= BRICKS_PER_CONSTRUCTION) {
            overshoot.z = jInConstruction - (BRICKS_PER_CONSTRUCTION - 1);
        }
        Mummu.RotateInPlace(overshoot, BABYLON.Axis.Y, -this.r * Math.PI / 0.5);
        this.posI -= overshoot.x;
        this.posJ -= overshoot.z;
    }
    get r() {
        let r = Math.round(this.rotation.y / (Math.PI * 0.5));
        while (r < 0) {
            r += 4;
        }
        while (r >= 4) {
            r -= 4;
        }
        return r;
    }
    set r(v) {
        this.rotation.y = v * Math.PI * 0.5;
    }
    dispose() {
        this.construction.bricks.remove(this);
    }
    cloneWithChildren() {
        let data = this.serialize();
        return Brick.Deserialize(data, this.construction);
    }
    posWorldToLocal(pos) {
        let matrix = this.getWorldMatrix().invert();
        return BABYLON.Vector3.TransformCoordinates(pos, matrix);
    }
    highlight() {
    }
    unlit() {
    }
    async generateMeshVertexData(vDatas, subMeshInfos) {
        let template = await BrickTemplateManager.Instance.getTemplate(this.index);
        let vData = Mummu.CloneVertexData(template.vertexData);
        let colors = [];
        let color = BABYLON.Color3.FromHexString(DodoColors[this.colorIndex].hex);
        for (let i = 0; i < vData.positions.length / 3; i++) {
            colors.push(color.r, color.g, color.b, 1);
        }
        vData.colors = colors;
        let a = 2 * Math.PI * Math.random();
        a = 0;
        let cosa = Math.cos(a);
        let sina = Math.sin(a);
        let dU = Math.random();
        dU = 0;
        let dV = Math.random();
        dV = 0;
        let uvs = vData.uvs;
        for (let i = 0; i < uvs.length / 2; i++) {
            let u = uvs[2 * i];
            let v = uvs[2 * i + 1];
            uvs[2 * i] = cosa * u - sina * v + dU;
            uvs[2 * i + 1] = sina * u + cosa * v + dV;
        }
        vData.uvs = uvs;
        Mummu.RotateAngleAxisVertexDataInPlace(vData, this.r * Math.PI * 0.5, BABYLON.Axis.Y);
        Mummu.TranslateVertexDataInPlace(vData, this.position);
        vDatas.push(vData);
        subMeshInfos.push({ faceId: 0, brick: this });
    }
    serialize() {
        let s = "";
        s += this.index.toString(16).padStart(3, "0").substring(0, 3);
        s += this.colorIndex.toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posI + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posJ + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posK + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += this.r.toString(16).padStart(1, "0").substring(0, 1);
        return s;
    }
    static Deserialize(data, parent) {
        let brick;
        let id = parseInt(data.substring(0, 3), 16);
        let colorIndex = parseInt(data.substring(3, 5), 16);
        let posI = parseInt(data.substring(5, 7), 16) - 64;
        let posJ = parseInt(data.substring(7, 9), 16) - 64;
        let posK = parseInt(data.substring(9, 11), 16) - 64;
        let r = parseInt(data.substring(11, 12), 16);
        if (parent instanceof Construction) {
            brick = new Brick(id, colorIndex, parent);
        }
        else {
            brick = new Brick(id, colorIndex);
            brick.parent = parent;
            brick.construction = parent.construction;
        }
        brick.posI = posI;
        brick.posJ = posJ;
        brick.posK = posK;
        brick.r = r;
        return brick;
    }
}
Brick.depthColors = [
    new BABYLON.Color4(1, 1, 1, 1),
    new BABYLON.Color4(1, 0, 0, 1),
    new BABYLON.Color4(0, 1, 0, 1),
    new BABYLON.Color4(0, 0, 1, 1),
    new BABYLON.Color4(1, 1, 0, 1),
    new BABYLON.Color4(0, 1, 1, 1),
    new BABYLON.Color4(1, 0, 1, 1),
    new BABYLON.Color4(1, 0.5, 0, 1),
    new BABYLON.Color4(0, 1, 0.5, 1),
    new BABYLON.Color4(0.5, 0, 1, 1),
    new BABYLON.Color4(1, 1, 0.5, 1),
    new BABYLON.Color4(0.5, 1, 1, 1),
    new BABYLON.Color4(1, 0.5, 1, 1),
    new BABYLON.Color4(0.2, 0.2, 0.2, 1)
];
var ALLBRICKS = [];
var BRICK_LIST = [
    "tile_1x1",
    "tile_2x1",
    "tile_3x1",
    "tile_4x1",
    "tile_5x1",
    "tile_6x1",
    "tile_7x1",
    "tile_8x1",
    "tile_9x1",
    "tile_10x1",
    "tile_11x1",
    "tile_12x1",
    "tile_13x1",
    "tile_14x1",
    "tile_15x1",
    "tile_16x1",
    "tile_2x2",
    "tile_3x2",
    "tile_4x2",
    "tile_5x2",
    "tile_6x2",
    "tile_7x2",
    "tile_8x2",
    "tile_9x2",
    "tile_10x2",
    "tile_11x2",
    "tile_12x2",
    "tile_13x2",
    "tile_14x2",
    "tile_15x2",
    "tile_16x2",
    "tile_3x3",
    "tile_4x4",
    "tile_5x5",
    "tile_6x6",
    "tile_7x7",
    "tile_8x8",
    "tile_9x9",
    "tile_10x10",
    "tile_11x11",
    "tile_12x12",
    "tile_13x13",
    "tile_14x14",
    "tile_15x15",
    "tile_16x16",
    "brick_1x1",
    "brick_2x1",
    "brick_3x1",
    "brick_4x1",
    "brick_5x1",
    "brick_6x1",
    "brick_7x1",
    "brick_8x1",
    "brick_9x1",
    "brick_10x1",
    "brick_11x1",
    "brick_12x1",
    "brick_13x1",
    "brick_14x1",
    "brick_15x1",
    "brick_16x1",
    "brick-corner-round_1x1",
    "brick-round_1x1",
    "brick-round_2x1",
    "brick-round_3x1",
    "brick-round_4x1",
    "brick-round_5x1",
    "brick-round_6x1",
    "brick-round_7x1",
    "brick-round_8x1",
    "brick-round_9x1",
    "brick-round_10x1",
    "brick-round_11x1",
    "brick-round_12x1",
    "brick-round_13x1",
    "brick-round_14x1",
    "brick-round_15x1",
    "brick-round_16x1",
    "tile-corner-curved_2x1",
    "tile-corner-curved_3x1",
    "tile-corner-curved_4x1",
    "tile-corner-curved_5x1",
    "tile-corner-curved_6x1",
    "tile-corner-curved_7x1",
    "tile-corner-curved_8x1",
    "tile-corner-curved_3x2",
    "tile-corner-curved_4x2",
    "tile-corner-curved_5x2",
    "tile-corner-curved_6x2",
    "tile-corner-curved_7x2",
    "tile-corner-curved_8x2",
    "brick-corner-curved_2x1",
    "brick-corner-curved_3x1",
    "brick-corner-curved_4x1",
    "brick-corner-curved_5x1",
    "brick-corner-curved_6x1",
    "brick-corner-curved_7x1",
    "brick-corner-curved_8x1",
    "window-frame_2x2",
    "window-frame_2x3",
    "window-frame_2x4",
    "window-frame_2x5",
    "window-frame_3x2",
    "window-frame_3x3",
    "window-frame_3x4",
    "window-frame_3x5",
    "window-frame_4x2",
    "window-frame_4x3",
    "window-frame_4x4",
    "window-frame_4x5",
    "window-frame-corner-curved_3x2",
    "window-frame-corner-curved_3x3",
    "window-frame-corner-curved_3x4",
    "window-frame-corner-curved_3x5",
    "plate-quarter_1x1",
    "plate-quarter_2x2",
    "plate-quarter_3x3",
    "plate-quarter_4x4",
    "plate-quarter_5x5",
    "plate-quarter_6x6",
    "plate-quarter_7x7",
    "plate-quarter_8x8",
    "brick-quarter_1x1",
    "brick-quarter_2x2",
    "brick-quarter_3x3",
    "brick-quarter_4x4",
    "brick-quarter_5x5",
    "brick-quarter_6x6",
    "brick-quarter_7x7",
    "brick-quarter_8x8",
];
class BrickTemplateManager {
    constructor(vertexDataLoader) {
        this.vertexDataLoader = vertexDataLoader;
        this._templates = [];
    }
    static get Instance() {
        if (!BrickTemplateManager._Instance) {
            BrickTemplateManager._Instance = new BrickTemplateManager(Game.Instance.vertexDataLoader);
        }
        return BrickTemplateManager._Instance;
    }
    async getTemplate(index) {
        if (!this._templates[index]) {
            this._templates[index] = await this.createTemplate(index);
        }
        return this._templates[index];
    }
    async createTemplate(index) {
        let template = new BrickTemplate(index, this);
        await template.load();
        return template;
    }
}
class BrickTemplate {
    constructor(index, brickTemplateManager) {
        this.index = index;
        this.brickTemplateManager = brickTemplateManager;
    }
    get name() {
        return BRICK_LIST[this.index];
    }
    async load(lod = 0) {
        //this.vertexData = (await this.brickTemplateManager.vertexDataLoader.get("./datas/meshes/plate_1x1.babylon"))[0];
        if (this.name.startsWith("brick_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let w = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = BrickVertexDataGenerator.GetBoxVertexData(l, 3, w, lod);
        }
        else if (this.name.startsWith("plate-corner-cut_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let w = parseInt(this.name.split("_")[1].split("x")[1]);
            let cut = 1;
            if (l >= 4) {
                cut = 2;
            }
            this.vertexData = await BrickVertexDataGenerator.GetStuddedCutBoxVertexData(cut, l, 1, w, lod);
        }
        else if (this.name.startsWith("wall_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let w = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = BrickVertexDataGenerator.GetBoxVertexData(l, 12, w, lod);
        }
        else if (this.name.startsWith("plate_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let w = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = BrickVertexDataGenerator.GetBoxVertexData(l, 1, w, lod);
        }
        else if (this.name.startsWith("tile_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let w = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = BrickVertexDataGenerator.GetBoxVertexData(l, 1, w, lod);
        }
        else if (this.name.startsWith("window-frame_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let h = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = await BrickVertexDataGenerator.GetWindowFrameVertexData(l, h, lod);
        }
        else if (this.name.startsWith("window-frame-corner-curved_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let h = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = await BrickVertexDataGenerator.GetWindowFrameCornerCurvedVertexData(l, h, lod);
        }
        else if (this.name.startsWith("tile-corner-curved_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let w = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = await BrickVertexDataGenerator.GetBoxCornerCurvedVertexData(l, 1, w, lod);
        }
        else if (this.name.startsWith("brick-corner-curved_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            let w = parseInt(this.name.split("_")[1].split("x")[1]);
            this.vertexData = await BrickVertexDataGenerator.GetBoxCornerCurvedVertexData(l, 3, w, lod);
        }
        else if (this.name.startsWith("plate-quarter_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            this.vertexData = await BrickVertexDataGenerator.GetBoxQuarterVertexData(l, 1, lod);
        }
        else if (this.name.startsWith("brick-quarter_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            this.vertexData = await BrickVertexDataGenerator.GetBoxQuarterVertexData(l, 3, lod);
        }
        else if (this.name.startsWith("brick-round_")) {
            let l = parseInt(this.name.split("_")[1].split("x")[0]);
            this.vertexData = await BrickVertexDataGenerator.GetBrickRoundVertexData(l, lod);
        }
        else if (this.name.startsWith("brick-corner-round_1x1")) {
            this.vertexData = (await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/brick-corner-round_1x1.babylon"))[0];
            BrickVertexDataGenerator.AddMarginInPlace(this.vertexData);
        }
        else if (this.name === "tile-round-quarter_1x1") {
            this.vertexData = (await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/tile-round-quarter_1x1.babylon"))[0];
            BrickVertexDataGenerator.AddMarginInPlace(this.vertexData);
        }
        else if (this.name === "tile-triangle_2x2") {
            this.vertexData = (await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/tile-triangle_2x2.babylon"))[0];
            BrickVertexDataGenerator.AddMarginInPlace(this.vertexData);
        }
        else {
            this.vertexData = BrickVertexDataGenerator.GetBoxVertexData(1, 1, 1);
        }
    }
}
var UV_S = 0.75;
class BrickVertexDataGenerator {
    static GetBoxVertexData(length, height, width, lod = 1) {
        let xMin = -BRICK_S * 0.5;
        let yMin = 0;
        let zMin = -BRICK_S * 0.5;
        let xMax = xMin + width * BRICK_S;
        let yMax = yMin + height * BRICK_H;
        let zMax = zMin + length * BRICK_S;
        let back = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMin, yMin, zMin),
            p2: new BABYLON.Vector3(xMax, yMin, zMin),
            p3: new BABYLON.Vector3(xMax, yMax, zMin),
            p4: new BABYLON.Vector3(xMin, yMax, zMin),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let right = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMin),
            p2: new BABYLON.Vector3(xMax, yMin, zMax),
            p3: new BABYLON.Vector3(xMax, yMax, zMax),
            p4: new BABYLON.Vector3(xMax, yMax, zMin),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let front = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMax),
            p2: new BABYLON.Vector3(xMin, yMin, zMax),
            p3: new BABYLON.Vector3(xMin, yMax, zMax),
            p4: new BABYLON.Vector3(xMax, yMax, zMax),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let left = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMin, yMin, zMax),
            p2: new BABYLON.Vector3(xMin, yMin, zMin),
            p3: new BABYLON.Vector3(xMin, yMax, zMin),
            p4: new BABYLON.Vector3(xMin, yMax, zMax),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let top = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMax, zMin),
            p2: new BABYLON.Vector3(xMax, yMax, zMax),
            p3: new BABYLON.Vector3(xMin, yMax, zMax),
            p4: new BABYLON.Vector3(xMin, yMax, zMin),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let bottom = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(xMax, yMin, zMin),
            p2: new BABYLON.Vector3(xMin, yMin, zMin),
            p3: new BABYLON.Vector3(xMin, yMin, zMax),
            p4: new BABYLON.Vector3(xMax, yMin, zMax),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let data = Mummu.MergeVertexDatas(back, right, front, left, top, bottom);
        BrickVertexDataGenerator.AddMarginInPlace(data);
        return data;
    }
    static async GetBoxCornerCurvedVertexData(length, height, width, lod = 1) {
        let innerR = (length - width) * BRICK_S;
        let outterR = length * BRICK_S;
        let y = height * BRICK_H;
        let back = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(innerR, 0, 0),
            p2: new BABYLON.Vector3(outterR, 0, 0),
            p3: new BABYLON.Vector3(outterR, y, 0),
            p4: new BABYLON.Vector3(innerR, y, 0),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let right = Mummu.CreateCylinderSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: outterR,
            yMin: 0,
            yMax: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let front = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(0, 0, outterR),
            p2: new BABYLON.Vector3(0, 0, innerR),
            p3: new BABYLON.Vector3(0, y, innerR),
            p4: new BABYLON.Vector3(0, y, outterR),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let left = Mummu.CreateCylinderSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: innerR,
            yMin: 0,
            yMax: y,
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let top = Mummu.CreateDiscSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            innerRadius: innerR,
            outterRadius: outterR,
            y: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let bottom = Mummu.CreateDiscSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            innerRadius: innerR,
            outterRadius: outterR,
            y: 0,
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let data = Mummu.MergeVertexDatas(back, right, front, left, top, bottom);
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(-innerR - BRICK_S * 0.5, 0, -BRICK_S * 0.5));
        BrickVertexDataGenerator.AddMarginInPlace(data);
        return data;
    }
    static async GetBoxQuarterVertexData(length, height, lod = 1) {
        let radius = length * BRICK_S;
        let y = height * BRICK_H;
        let back = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(0, 0, 0),
            p2: new BABYLON.Vector3(radius, 0, 0),
            p3: new BABYLON.Vector3(radius, y, 0),
            p4: new BABYLON.Vector3(0, y, 0),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let right = Mummu.CreateCylinderSliceVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: radius,
            yMin: 0,
            yMax: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let front = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(0, 0, radius),
            p2: new BABYLON.Vector3(0, 0, 0),
            p3: new BABYLON.Vector3(0, y, 0),
            p4: new BABYLON.Vector3(0, y, radius),
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let top = Mummu.CreateDiscVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: radius,
            y: y,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let bottom = Mummu.CreateDiscVertexData({
            alphaMin: 0,
            alphaMax: Math.PI * 0.5,
            radius: radius,
            y: 0,
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            tesselation: 5,
            uvInWorldSpace: true,
            uvSize: UV_S
        });
        let data = Mummu.MergeVertexDatas(back, right, front, top, bottom);
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(-BRICK_S * 0.5, 0, -BRICK_S * 0.5));
        BrickVertexDataGenerator.AddMarginInPlace(data);
        return data;
    }
    static async GetStuddedCutBoxVertexData(cut, length, height, width, lod = 1) {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/plate-corner-cut.babylon");
        let cutBoxRawData = Mummu.CloneVertexData(datas[0]);
        let dx = (width - 2) * BRICK_S;
        let dxCut = (cut - 1) * BRICK_S;
        let dy = (height - 1) * BRICK_H;
        let dz = (length - 2) * BRICK_S;
        let dzCut = (cut - 1) * BRICK_S;
        let positions = cutBoxRawData.positions;
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];
            if (x > BRICK_S) {
                x += dx;
            }
            else if (x > 0) {
                x += dxCut;
            }
            if (y > BRICK_H * 0.5) {
                y += dy;
            }
            if (z > BRICK_S) {
                z += dz;
            }
            else if (z > 0) {
                z += dzCut;
            }
            positions[3 * i] = x;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;
        }
        cutBoxRawData.positions = positions;
        let normals = [];
        BABYLON.VertexData.ComputeNormals(cutBoxRawData.positions, cutBoxRawData.indices, normals);
        cutBoxRawData.normals = normals;
        cutBoxRawData.colors = undefined;
        BrickVertexDataGenerator.AddMarginInPlace(cutBoxRawData);
        return cutBoxRawData;
    }
    static async GetWindowFrameVertexData(length, height, lod = 1) {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/window-frame_2x2.babylon");
        let cutBoxRawData = Mummu.CloneVertexData(datas[0]);
        let dy = (height - 2) * BRICK_H * 3;
        let dz = (length - 2) * BRICK_S;
        let positions = cutBoxRawData.positions;
        let normals = cutBoxRawData.normals;
        let uvs = cutBoxRawData.uvs;
        for (let i = 0; i < positions.length / 3; i++) {
            let nx = normals[3 * i];
            let ny = normals[3 * i + 1];
            let nz = normals[3 * i + 2];
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];
            let face = 0;
            if (nx > 0.9) {
                face = 1;
            }
            else if (nx < -0.9) {
                face = 1;
            }
            else if (y < 0.001 && ny < -0.9) {
                face = 2;
            }
            else if (y > 6 * BRICK_H - 0.001 && ny > 0.9) {
                face = 2;
            }
            else if (z < -0.5 * BRICK_S + 0.01 && nz < -0.9) {
                face = 3;
            }
            else if (z > BRICK_S * 1.5 - 0.01 && nz > 0.9) {
                face = 3;
            }
            else {
                if (y > BRICK_H * 3 && z > BRICK_S * 0.5) {
                    // do nothing
                    if (uvs[2 * i] > 1) {
                        uvs[2 * i] += 2 * dy + 2 * dz;
                    }
                }
                else if (y < BRICK_H * 3 && z > BRICK_S * 0.5) {
                    uvs[2 * i] += dy;
                }
                else if (y < BRICK_H * 3 && z < BRICK_S * 0.5) {
                    uvs[2 * i] += dy + dz;
                }
                else if (y > BRICK_H * 3 && z < BRICK_S * 0.5) {
                    uvs[2 * i] += 2 * dy + dz;
                }
            }
            if (y > BRICK_H * 3) {
                y += dy;
            }
            if (z > BRICK_S * 0.5) {
                z += dz;
            }
            if (face === 1) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = y;
            }
            else if (face === 2) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = x;
            }
            else if (face === 3) {
                uvs[2 * i] = x;
                uvs[2 * i + 1] = y;
            }
            uvs[2 * i] /= UV_S;
            uvs[2 * i + 1] /= UV_S;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;
        }
        cutBoxRawData.positions = positions;
        cutBoxRawData.uvs = uvs;
        BABYLON.VertexData.ComputeNormals(cutBoxRawData.positions, cutBoxRawData.indices, normals);
        cutBoxRawData.normals = normals;
        cutBoxRawData.colors = undefined;
        BrickVertexDataGenerator.AddMarginInPlace(cutBoxRawData);
        return cutBoxRawData;
    }
    static async GetWindowFrameCornerCurvedVertexData(length, height, lod = 1) {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/window-frame-corner_" + length + ".babylon");
        let index = height - 2;
        let data = Mummu.CloneVertexData(datas[index]);
        if (data) {
            let uvs = data.uvs;
            for (let i = 0; i < uvs.length; i++) {
                uvs[i] = uvs[i] / UV_S;
            }
            data.uvs = uvs;
            BrickVertexDataGenerator.AddMarginInPlace(data);
            return data;
        }
        return undefined;
    }
    static async GetBrickRoundVertexData(length, lod = 1) {
        let datas = await BrickTemplateManager.Instance.vertexDataLoader.get("./datas/meshes/brick-round_1x1.babylon");
        let cutBoxRawData = Mummu.CloneVertexData(datas[0]);
        let dz = (length - 1) * BRICK_S;
        let positions = cutBoxRawData.positions;
        let normals = cutBoxRawData.normals;
        let uvs = cutBoxRawData.uvs;
        for (let i = 0; i < positions.length / 3; i++) {
            let nx = normals[3 * i];
            let ny = normals[3 * i + 1];
            let nz = normals[3 * i + 2];
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];
            if (z > 0) {
                z += dz;
            }
            if (ny < -0.9) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = x;
            }
            else if (nx < -0.9) {
                uvs[2 * i] = z;
                uvs[2 * i + 1] = y;
            }
            else if (nz < -0.9 || nz > 0.9) {
            }
            else {
                if (z > 0) {
                    uvs[2 * i] += dz;
                }
            }
            positions[3 * i + 2] = z;
        }
        cutBoxRawData.positions = positions;
        cutBoxRawData.uvs = uvs;
        cutBoxRawData.colors = undefined;
        BrickVertexDataGenerator.AddMarginInPlace(cutBoxRawData);
        return cutBoxRawData;
    }
    static AddMarginInPlace(vertexData, margin = 0.001, cx = 0, cy = BRICK_H * 0.5, cz = 0) {
        let positions = vertexData.positions;
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];
            if (x > cx) {
                x -= margin;
            }
            else {
                x += margin;
            }
            if (y > cy) {
                y -= margin;
            }
            else {
                y += margin;
            }
            if (z > cz) {
                z -= margin;
            }
            else {
                z += margin;
            }
            positions[3 * i] = x;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;
        }
    }
}
class Construction extends BABYLON.Mesh {
    constructor(i, j, terrain) {
        super("construction_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.i = i;
        this.j = j;
        this.terrain = terrain;
        this.bricks = new Nabu.UniqueList();
        this.barycenter = BABYLON.Vector3.Zero();
        this.position.copyFromFloats(this.i * Construction.SIZE_m, 0, this.j * Construction.SIZE_m);
        this.barycenter.copyFrom(this.position);
        this.barycenter.x += Construction.SIZE_m * 0.5;
        this.barycenter.z += Construction.SIZE_m * 0.5;
    }
    isPlayerAllowedToEdit() {
        return this.terrain.game.devMode.activated || (this.i === this.terrain.game.networkManager.claimedConstructionI && this.j === this.terrain.game.networkManager.claimedConstructionJ);
    }
    static worldPosToIJ(pos) {
        let i = Math.floor((pos.x + BRICK_S * 0.5) / Construction.SIZE_m);
        let j = Math.floor((pos.z + BRICK_S * 0.5) / Construction.SIZE_m);
        return { i: i, j: j };
    }
    async instantiate() {
        if (this.terrain.game.devMode.activated || this.terrain.game.networkManager.claimedConstructionI === this.i && this.terrain.game.networkManager.claimedConstructionJ === this.j) {
            this.showLimits();
        }
    }
    getBrickForFaceId(faceId) {
        for (let i = 0; i < this.subMeshInfos.length; i++) {
            if (this.subMeshInfos[i].faceId > faceId) {
                return this.subMeshInfos[i].brick;
            }
        }
    }
    async updateMesh() {
        let vDatas = [];
        this.subMeshInfos = [];
        for (let i = 0; i < this.bricks.length; i++) {
            await this.bricks.get(i).generateMeshVertexData(vDatas, this.subMeshInfos);
        }
        let data = Construction.MergeVertexDatas(this.subMeshInfos, ...vDatas);
        if (!this.mesh) {
            this.mesh = new ConstructionMesh(this);
            //this.mesh.layerMask |= 0x20000000;
            //this.mesh.parent = this;
            //let brickMaterial = new BABYLON.StandardMaterial("brick-material");
            //brickMaterial.specularColor.copyFromFloats(0, 0, 0);
            //brickMaterial.bumpTexture = new BABYLON.Texture("./datas/textures/test-steel-normal-dx.png", undefined, undefined, true);
            //brickMaterial.invertNormalMapX = true;
            //brickMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-white-squares.png");
            /*
            let steelMaterial = new ToonMaterial("steel", this.mesh._scene);
            steelMaterial.setDiffuse(BABYLON.Color3.FromHexString("#868b8a"));
            steelMaterial.setSpecularIntensity(1);
            steelMaterial.setSpecularCount(4);
            steelMaterial.setSpecularPower(32);
            steelMaterial.setUseVertexColor(true);

            let logoMaterial = new ToonMaterial("logo", this.mesh._scene);
            logoMaterial.setDiffuse(BABYLON.Color3.FromHexString("#262b2a"));
            logoMaterial.setSpecularIntensity(0.5);
            logoMaterial.setSpecularCount(1);
            logoMaterial.setSpecularPower(16);
            logoMaterial.setUseLightFromPOV(true);
            logoMaterial.setUseFlatSpecular(true);
            */
            this.mesh.material = this.terrain.game.defaultToonMaterial;
        }
        data.applyToMesh(this.mesh);
    }
    static MergeVertexDatas(subMeshInfos, ...datas) {
        let mergedData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let colors = [];
        for (let i = 0; i < datas.length; i++) {
            let offset = positions.length / 3;
            positions.push(...datas[i].positions);
            indices.push(...datas[i].indices.map(index => { return index + offset; }));
            normals.push(...datas[i].normals);
            if (datas[i].uvs) {
                uvs.push(...datas[i].uvs);
            }
            if (datas[i].colors) {
                colors.push(...datas[i].colors);
            }
            subMeshInfos[i].faceId = indices.length / 3;
        }
        mergedData.positions = positions;
        mergedData.indices = indices;
        mergedData.normals = normals;
        if (uvs.length > 0) {
            mergedData.uvs = uvs;
        }
        if (colors.length > 0) {
            mergedData.colors = colors;
        }
        return mergedData;
    }
    async showLimits() {
        if (this.limits) {
            this.limits.dispose();
        }
        let min = new BABYLON.Vector3(-BRICK_S * 0.5, 0, -BRICK_S * 0.5);
        let max = min.add(new BABYLON.Vector3(Construction.SIZE_m, 0, Construction.SIZE_m));
        this.limits = BABYLON.MeshBuilder.CreateBox("limits", { width: Construction.SIZE_m, height: 256, depth: Construction.SIZE_m, sideOrientation: BABYLON.Mesh.BACKSIDE });
        let material = new BABYLON.StandardMaterial("limit-material");
        material.specularColor.copyFromFloats(0, 0, 0);
        material.diffuseColor.copyFromFloats(0, 1, 1);
        this.limits.material = material;
        this.limits.position.copyFrom(min).addInPlace(max).scaleInPlace(0.5);
        this.limits.visibility = 0.2;
        this.limits.isVisible = false;
        this.limits.parent = this;
        let worldOffset = this.position.add(this.limits.position);
        let points = [
            new BABYLON.Vector3(-0.5 * Construction.SIZE_m, 0, -0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(0.5 * Construction.SIZE_m, 0, -0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(0.5 * Construction.SIZE_m, 0, 0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(-0.5 * Construction.SIZE_m, 0, 0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(-0.5 * Construction.SIZE_m, 0, -0.5 * Construction.SIZE_m)
        ];
        let N = BRICKS_PER_CONSTRUCTION;
        let subdividedPoints = [];
        for (let i = 0; i < 4; i++) {
            let start = points[i];
            let end = points[i + 1];
            for (let n = 0; n < N; n++) {
                let f = n / N;
                let p = BABYLON.Vector3.Lerp(start, end, f);
                if (n === 0) {
                    //let r = p.clone().normalize();
                    //p.subtractInPlace(r.scale(Construction.SIZE_m / N * 0.3));
                }
                subdividedPoints.push(p);
            }
        }
        points = subdividedPoints;
        points.forEach(pt => {
            pt.addInPlace(worldOffset);
            pt.y = this.terrain.worldPosToTerrainAltitude(pt);
            pt.subtractInPlace(worldOffset);
        });
        //Mummu.CatmullRomClosedPathInPlace(points);
        //Mummu.CatmullRomClosedPathInPlace(points);
        points.push(points[0]);
        //let border = BABYLON.MeshBuilder.CreateLines("border", { points: points });
        //border.position.y = 1 * BRICK_H;
        //border.parent = this.limits;
        let lines = [
            //points.map(pt => { return pt.clone().addInPlaceFromFloats(0, + 2 * BRICK_H, 0); }),
            points.map(pt => { return pt.clone().addInPlaceFromFloats(0, +3 * BRICK_H, 0); }),
        ];
        //for (let i = 0; i < points.length; i++) {
        //    let pt = points[i];
        //    lines.push([
        //        pt.clone().addInPlaceFromFloats(0, + 2 * BRICK_H, 0),
        //        pt.clone().addInPlaceFromFloats(0, + 3 * BRICK_H, 0)
        //    ])
        //}
        let border2 = BABYLON.MeshBuilder.CreateLineSystem("border2", { lines: lines });
        border2.parent = this.limits;
    }
    hideLimits() {
        if (this.limits) {
            this.limits.dispose();
        }
    }
    async saveToServer() {
        let constructionData = {
            i: this.i,
            j: this.j,
            content: this.serialize(),
            token: this.terrain.game.networkManager.token
        };
        let headers = {
            "Content-Type": "application/json",
        };
        if (this.terrain.game.devMode.activated) {
            headers["Authorization"] = 'Basic ' + btoa("carillon:" + this.terrain.game.devMode.getPassword());
        }
        let dataString = JSON.stringify(constructionData);
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "set_construction", {
                method: "POST",
                mode: "cors",
                headers: headers,
                body: dataString,
            });
            let responseText = await response.text();
            console.log("Construction.saveToServer" + responseText);
        }
        catch (e) {
            console.error(e);
            ScreenLoger.Log("saveToServer error");
            ScreenLoger.Log(e);
        }
    }
    async buildFromServer() {
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "get_construction/" + this.i.toFixed(0) + "/" + this.j.toFixed(0), {
                method: "GET",
                mode: "cors"
            });
            let responseText = await response.text();
            if (responseText) {
                let response = JSON.parse(responseText);
                this.deserialize(response.content);
            }
        }
        catch (e) {
            console.error(e);
            ScreenLoger.Log("buildFromServer error");
            ScreenLoger.Log(e);
        }
    }
    saveToLocalStorage() {
        window.localStorage.setItem("construction_" + this.i.toFixed(0) + "_" + this.j.toFixed(0), this.serialize());
    }
    buildFromLocalStorage() {
        let dataString = window.localStorage.getItem("construction_" + this.i.toFixed(0) + "_" + this.j.toFixed(0));
        if (dataString) {
            this.deserialize(dataString);
        }
    }
    serialize() {
        let bricks = [];
        for (let i = 0; i < this.bricks.length; i++) {
            bricks.push(this.bricks.get(i).serialize());
        }
        return JSON.stringify(bricks);
    }
    deserialize(dataString) {
        let data = JSON.parse(dataString);
        for (let i = 0; i < data.length; i++) {
            let brick = Brick.Deserialize(data[i], this);
            this.updateMesh();
            this.bricks.push(brick);
        }
    }
}
Construction.SIZE_m = BRICKS_PER_CONSTRUCTION * BRICK_S;
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
        this.speed = 2;
        this.animatedSpeed = BABYLON.Vector3.Zero();
        this.animatedRSpeed = 0;
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
/// <reference path="Creature.ts"/>
function IsStyleNetworkData(v) {
    if (v.style) {
        return true;
    }
    return false;
}
/*
var DodoColors = [
    BABYLON.Color3.FromHexString("#17171c"),
    BABYLON.Color3.FromHexString("#282a30"),
    BABYLON.Color3.FromHexString("#49363a"),
    BABYLON.Color3.FromHexString("#404735"),
    BABYLON.Color3.FromHexString("#3b536a"),
    BABYLON.Color3.FromHexString("#9b3535"),
    BABYLON.Color3.FromHexString("#92583f"),
    BABYLON.Color3.FromHexString("#21927e"),
    BABYLON.Color3.FromHexString("#a16a41"),
    BABYLON.Color3.FromHexString("#7e7b71"),
    BABYLON.Color3.FromHexString("#71a14e"),
    BABYLON.Color3.FromHexString("#be8d68"),
    BABYLON.Color3.FromHexString("#7abbb9"),
    BABYLON.Color3.FromHexString("#d9bd66"),
    BABYLON.Color3.FromHexString("#e8c6a1"),
    BABYLON.Color3.FromHexString("#dcd6cf")
];
*/
var StyleValueTypes;
(function (StyleValueTypes) {
    StyleValueTypes[StyleValueTypes["Color0"] = 0] = "Color0";
    StyleValueTypes[StyleValueTypes["Color1"] = 1] = "Color1";
    StyleValueTypes[StyleValueTypes["Color2"] = 2] = "Color2";
    StyleValueTypes[StyleValueTypes["EyeColor"] = 3] = "EyeColor";
    StyleValueTypes[StyleValueTypes["HatIndex"] = 4] = "HatIndex";
    StyleValueTypes[StyleValueTypes["HatColor"] = 5] = "HatColor";
    StyleValueTypes[StyleValueTypes["COUNT"] = 6] = "COUNT";
})(StyleValueTypes || (StyleValueTypes = {}));
var DodoColors = [
    { name: "Chinese Black", color: BABYLON.Color3.FromHexString("#10121c"), textColor: "black", hex: "#000000" },
    { name: "Quartz", color: BABYLON.Color3.FromHexString("#494b57"), textColor: "black", hex: "#000000" },
    { name: "Dark Purple", color: BABYLON.Color3.FromHexString("#2c1e31"), textColor: "black", hex: "#000000" },
    { name: "Old Mauve", color: BABYLON.Color3.FromHexString("#6b2643"), textColor: "black", hex: "#000000" },
    { name: "Amaranth Purple", color: BABYLON.Color3.FromHexString("#ac2847"), textColor: "black", hex: "#000000" },
    { name: "Imperial Red", color: BABYLON.Color3.FromHexString("#ec273f"), textColor: "black", hex: "#000000" },
    { name: "Chestnut", color: BABYLON.Color3.FromHexString("#94493a"), textColor: "black", hex: "#000000" },
    { name: "Medium Vermilion", color: BABYLON.Color3.FromHexString("#de5d3a"), textColor: "black", hex: "#000000" },
    { name: "Cadmium Orange", color: BABYLON.Color3.FromHexString("#e98537"), textColor: "black", hex: "#000000" },
    { name: "Deep Saffron", color: BABYLON.Color3.FromHexString("#f3a833"), textColor: "black", hex: "#000000" },
    { name: "Royal Brown", color: BABYLON.Color3.FromHexString("#4d3533"), textColor: "black", hex: "#000000" },
    { name: "Coffee", color: BABYLON.Color3.FromHexString("#6e4c30"), textColor: "black", hex: "#000000" },
    { name: "Metallic Bronze", color: BABYLON.Color3.FromHexString("#a26d3f"), textColor: "black", hex: "#000000" },
    { name: "Peru", color: BABYLON.Color3.FromHexString("#ce9248"), textColor: "black", hex: "#000000" },
    { name: "Earth Yellow", color: BABYLON.Color3.FromHexString("#dab163"), textColor: "black", hex: "#000000" },
    { name: "Flax", color: BABYLON.Color3.FromHexString("#e8d282"), textColor: "black", hex: "#000000" },
    { name: "Blond", color: BABYLON.Color3.FromHexString("#f7f3b7"), textColor: "black", hex: "#000000" },
    { name: "Japanese Indigo", color: BABYLON.Color3.FromHexString("#1e4044"), textColor: "black", hex: "#000000" },
    { name: "Bangladesh Green", color: BABYLON.Color3.FromHexString("#006554"), textColor: "black", hex: "#000000" },
    { name: "Sea Green", color: BABYLON.Color3.FromHexString("#26854c"), textColor: "black", hex: "#000000" },
    { name: "Apple", color: BABYLON.Color3.FromHexString("#5ab552"), textColor: "black", hex: "#000000" },
    { name: "Kiwi", color: BABYLON.Color3.FromHexString("#9de64e"), textColor: "black", hex: "#000000" },
    { name: "Dark Cyan", color: BABYLON.Color3.FromHexString("#008b8b"), textColor: "black", hex: "#000000" },
    { name: "Forest Green", color: BABYLON.Color3.FromHexString("#62a477"), textColor: "black", hex: "#000000" },
    { name: "Laurel Green", color: BABYLON.Color3.FromHexString("#a6cb96"), textColor: "black", hex: "#000000" },
    { name: "Tea Green", color: BABYLON.Color3.FromHexString("#d3eed3"), textColor: "black", hex: "#000000" },
    { name: "American Blue", color: BABYLON.Color3.FromHexString("#3e3b65"), textColor: "black", hex: "#000000" },
    { name: "Violet-Blue", color: BABYLON.Color3.FromHexString("#3859b3"), textColor: "black", hex: "#000000" },
    { name: "Bleu De France", color: BABYLON.Color3.FromHexString("#3388de"), textColor: "black", hex: "#000000" },
    { name: "Picton Blue", color: BABYLON.Color3.FromHexString("#36c5f4"), textColor: "black", hex: "#000000" },
    { name: "Aquamarine", color: BABYLON.Color3.FromHexString("#6dead6"), textColor: "black", hex: "#000000" },
    { name: "Dark Blue-Gray", color: BABYLON.Color3.FromHexString("#5e5b8c"), textColor: "black", hex: "#000000" },
    { name: "Purple Mountain", color: BABYLON.Color3.FromHexString("#8c78a5"), textColor: "black", hex: "#000000" },
    { name: "Pastel Purple", color: BABYLON.Color3.FromHexString("#b0a7b8"), textColor: "black", hex: "#000000" },
    { name: "Soap", color: BABYLON.Color3.FromHexString("#deceed"), textColor: "black", hex: "#000000" },
    { name: "Sugar Plum", color: BABYLON.Color3.FromHexString("#9a4d76"), textColor: "black", hex: "#000000" },
    { name: "Sky Magenta", color: BABYLON.Color3.FromHexString("#c878af"), textColor: "black", hex: "#000000" },
    { name: "Pale Violet", color: BABYLON.Color3.FromHexString("#cc99ff"), textColor: "black", hex: "#000000" },
    { name: "Begonia", color: BABYLON.Color3.FromHexString("#fa6e79"), textColor: "black", hex: "#000000" },
    { name: "Baker-Miller Pink", color: BABYLON.Color3.FromHexString("#ffa2ac"), textColor: "black", hex: "#000000" },
    { name: "Light Red", color: BABYLON.Color3.FromHexString("#ffd1d5"), textColor: "black", hex: "#000000" },
    { name: "Misty Rose", color: BABYLON.Color3.FromHexString("#f6e8e0"), textColor: "black", hex: "#000000" },
    { name: "White", color: BABYLON.Color3.FromHexString("#ffffff"), textColor: "black", hex: "#000000" }
];
DodoColors.forEach(c => {
    let sum = c.color.r + c.color.g + c.color.b;
    if (sum < 1.5) {
        c.textColor = "white";
    }
    else {
        c.textColor = "black";
    }
    c.hex = c.color.toHexString();
});
function DodoColorIdToIndex(colorID) {
    if (typeof (colorID) === "number") {
        return colorID;
    }
    else {
        return DodoColors.findIndex(color => { return color.name === colorID; });
    }
}
function DodoColorIdToName(colorID) {
    if (typeof (colorID) === "string") {
        return colorID;
    }
    else {
        return DodoColors[colorID].name;
    }
}
class DodoCollider extends BABYLON.Mesh {
    constructor(dodo) {
        super("dodo-collider");
        this.dodo = dodo;
    }
    highlight() {
        this.visibility = 0.5;
    }
    unlit() {
        this.visibility = 0;
    }
}
class Dodo extends Creature {
    constructor(peerId, name, game, prop) {
        super(peerId, game);
        this.peerId = null;
        this.gameId = -1;
        this.stepDuration = 0.2;
        this.colors = [];
        this.eyeColor = 0;
        this.currentChuncks = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
        this.currentConstructions = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
        this.targetLook = BABYLON.Vector3.Zero();
        this.bodyTargetPos = BABYLON.Vector3.Zero();
        this.bodyVelocity = BABYLON.Vector3.Zero();
        this.headVelocity = BABYLON.Vector3.Zero();
        this.tailTargetPos = BABYLON.Vector3.Zero();
        this.hatType = 0;
        this.hatColor = 0;
        //public topEyelids: BABYLON.Mesh[];
        //public bottomEyelids: BABYLON.Mesh[];
        //public wing: BABYLON.Mesh;
        //public canon: BABYLON.Mesh;
        this.stepHeight = 0.1;
        this.foldedBodyHeight = 0.1;
        this.unfoldedBodyHeight = 0.5;
        this.bodyHeight = this.foldedBodyHeight;
        this.animateWait = Mummu.AnimationFactory.EmptyVoidCallback;
        this.animateBodyHeight = Mummu.AnimationFactory.EmptyNumberCallback;
        //public animateCanonRotX = Mummu.AnimationFactory.EmptyNumberCallback;
        //public animateTopEyeLids = [Mummu.AnimationFactory.EmptyNumberCallback];
        //public animateBottomEyeLids = [Mummu.AnimationFactory.EmptyNumberCallback];
        this.animateJaw = Mummu.AnimationFactory.EmptyNumberCallback;
        this.hipPos = new BABYLON.Vector3(.20792, -0.13091, 0);
        this.upperLegLength = 0.217;
        this.lowerLegLength = 0.224;
        this._tmpForwardAxis = BABYLON.Vector3.Forward();
        this._instantiated = false;
        this.isGrounded = false;
        this.jumping = false;
        this.walking = 0;
        this.footIndex = 0;
        this._jumpTimer = 0;
        this._jumpingFootTargets = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero()];
        this._lastR = 0;
        this.gravityVelocity = 0;
        this._constructionRange = { di0: 0, di1: 0, dj0: 0, dj1: 0 };
        this.name = name;
        this.peerId = peerId;
        this.colors = [];
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
            if (prop.style) {
                this.setStyle(prop.style);
            }
        }
        if (this.colors.length === 0) {
            let c1 = Math.floor(Math.random() * DodoColors.length);
            let c2 = Math.floor(Math.random() * DodoColors.length);
            let c3 = Math.floor(Math.random() * DodoColors.length);
            let c4 = Math.floor(Math.random() * DodoColors.length);
            let style = c1.toString(16).padStart(2, "0") + c2.toString(16).padStart(2, "0") + c3.toString(16).padStart(2, "0") + c4.toString(16).padStart(2, "0");
            this.setStyle(style);
        }
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.body = Dodo.OutlinedMesh("body");
        this.head = Dodo.OutlinedMesh("head");
        this.head.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.hat = Dodo.OutlinedMesh("hat");
        this.hat.parent = this.head;
        this.jaw = Dodo.OutlinedMesh("jaw");
        this.jaw.parent = this.head;
        this.jaw.position.copyFromFloats(0, -0.078575, 0.055646);
        this.eyes = [
            new BABYLON.Mesh("eyeR"),
            new BABYLON.Mesh("eyeL")
        ];
        this.eyes[0].parent = this.head;
        this.eyes[0].position.copyFromFloats(0.09299, 0.125989, 0.076938);
        this.eyes[1].parent = this.head;
        this.eyes[1].position.copyFromFloats(-0.09299, 0.125989, 0.076938);
        this.tail = new BABYLON.Mesh("tail");
        this.tail.position.copyFromFloats(0, -0.08, -0.33);
        this.tail.parent = this.body;
        this.tailFeathers = [
            Dodo.OutlinedMesh("tailFeatherR"),
            Dodo.OutlinedMesh("tailFeatherM"),
            Dodo.OutlinedMesh("tailFeatherL")
        ];
        this.tailFeathers[0].parent = this.tail;
        this.tailFeathers[0].position.copyFromFloats(0.020, -0.03, -0.02);
        this.tailFeathers[0].rotation.y = -Math.PI / 14;
        this.tailFeathers[0].scaling.scaleInPlace(0.8 + 0.4 * Math.random());
        this.tailFeathers[1].parent = this.tail;
        this.tailFeathers[1].position.copyFromFloats(0, 0.015, 0);
        this.tailFeathers[1].rotation.x = Math.PI / 14;
        this.tailFeathers[1].scaling.scaleInPlace(0.8 + 0.4 * Math.random());
        this.tailFeathers[2].parent = this.tail;
        this.tailFeathers[2].position.copyFromFloats(-0.020, -0.03, -0.02);
        this.tailFeathers[2].rotation.y = Math.PI / 14;
        this.tailFeathers[2].scaling.scaleInPlace(0.8 + 0.4 * Math.random());
        BABYLON;
        this.dodoCollider = new DodoCollider(this);
        this.dodoCollider.parent = this;
        this.dodoCollider.position.copyFromFloats(0, this.unfoldedBodyHeight + 0.05, 0);
        BABYLON.CreateSphereVertexData({ diameter: 2 * BRICK_S }).applyToMesh(this.dodoCollider);
        this.dodoCollider.visibility = 0;
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
        this.neck = Dodo.OutlinedMesh("neck");
        this.hitCollider = new BABYLON.Mesh("hit-collider");
        this.hitCollider.parent = this;
        this.hitCollider.isVisible = false;
        this.hitCollider.parent = this.body;
        this.animateWait = Mummu.AnimationFactory.CreateWait(this);
        this.animateBodyHeight = Mummu.AnimationFactory.CreateNumber(this, this, "bodyHeight", undefined, undefined, Nabu.Easing.easeInOutSine);
        this.animateJaw = Mummu.AnimationFactory.CreateNumber(this, this.jaw.rotation, "x");
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
    get isPlayerControlled() {
        return this === this.game.playerDodo;
    }
    static OutlinedMesh(name) {
        let mesh = new BABYLON.Mesh(name);
        mesh.renderOutline = false;
        mesh.outlineColor.copyFromFloats(0, 0, 0);
        mesh.outlineWidth = 0.01;
        return mesh;
    }
    get r() {
        return Mummu.AngleFromToAround(BABYLON.Axis.Z, this.forward, BABYLON.Axis.Y);
    }
    set r(v) {
        Mummu.RotateToRef(BABYLON.Axis.Z, BABYLON.Axis.Y, v, this._tmpForwardAxis);
        Mummu.QuaternionFromZYAxisToRef(this._tmpForwardAxis, BABYLON.Axis.Y, this.rotationQuaternion);
    }
    get bodyR() {
        return Mummu.AngleFromToAround(BABYLON.Axis.Z, this.body.forward, BABYLON.Axis.Y);
    }
    getStyleValue(type) {
        if (this.style.length != 2 * StyleValueTypes.COUNT) {
            this.style = this.style.padEnd(2 * StyleValueTypes.COUNT, "0");
            this.style = this.style.substring(0, 2 * StyleValueTypes.COUNT);
        }
        return parseInt(this.style.substring(2 * type, 2 * (type + 1)), 16);
    }
    setStyleValue(value, type) {
        if (this.style.length != 2 * StyleValueTypes.COUNT) {
            this.style = this.style.padEnd(2 * StyleValueTypes.COUNT, "0");
            this.style = this.style.substring(0, 2 * StyleValueTypes.COUNT);
        }
        let style = "";
        if (type > StyleValueTypes.Color0) {
            style += this.style.substring(0, 2 * (type));
        }
        style += value.toString(16).padStart(2, "0");
        if (type < StyleValueTypes.COUNT - 1) {
            style += this.style.substring(2 * (type + 1));
        }
        this.setStyle(style);
    }
    setStyle(style) {
        this.style = style;
        this.colors[0] = DodoColors[this.getStyleValue(StyleValueTypes.Color0)].color;
        this.colors[1] = DodoColors[this.getStyleValue(StyleValueTypes.Color1)].color;
        this.colors[2] = DodoColors[this.getStyleValue(StyleValueTypes.Color2)].color;
        this.eyeColor = this.getStyleValue(StyleValueTypes.EyeColor);
        this.hatType = this.getStyleValue(StyleValueTypes.HatIndex);
        this.hatColor = this.getStyleValue(StyleValueTypes.HatColor);
        SavePlayerToLocalStorage(this.game);
        if (this._instantiated) {
            this.instantiate();
        }
    }
    async instantiate() {
        this.material = this.game.defaultToonMaterial;
        this.body.material = this.material;
        this.head.material = this.material;
        this.jaw.material = this.material;
        this.eyeMaterial = new BABYLON.StandardMaterial("eye-material");
        this.eyeMaterial.specularColor.copyFromFloats(0, 0, 0);
        let eyeTexture = new BABYLON.DynamicTexture("eye-texture", 256);
        let context = eyeTexture.getContext();
        context.fillStyle = "white";
        context.fillRect(0, 0, 256, 256);
        context.beginPath();
        context.fillStyle = DodoColors[this.eyeColor].hex;
        context.arc(128, 128, 64, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.beginPath();
        context.fillStyle = "black";
        context.arc(128, 128, 32, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.beginPath();
        context.fillStyle = "white";
        context.arc(91, 91, 7, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.beginPath();
        context.fillStyle = "white";
        context.arc(150, 150, 15, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        eyeTexture.update();
        this.eyeMaterial.diffuseTexture = eyeTexture;
        this.eyeMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.eyes[0].material = this.eyeMaterial;
        this.eyes[1].material = this.eyeMaterial;
        this.tailFeathers[0].material = this.material;
        this.tailFeathers[1].material = this.material;
        this.tailFeathers[2].material = this.material;
        this.hat.material = this.material;
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
        let roboDatas = await this.game.vertexDataLoader.get("./datas/meshes/robododo.babylon");
        roboDatas = roboDatas.map(vertexData => {
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
        datas[5].applyToMesh(this.tailFeathers[0]);
        datas[5].applyToMesh(this.tailFeathers[1]);
        datas[5].applyToMesh(this.tailFeathers[2]);
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
        datas[7].applyToMesh(this.jaw);
        if (this.hatType === 0) {
            this.hat.isVisible = false;
        }
        else {
            this.hat.isVisible = true;
            if (this.hatType === 1) {
                Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(datas[8]), DodoColors[this.hatColor].color).applyToMesh(this.hat);
            }
            else if (this.hatType === 2) {
                Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(datas[9]), DodoColors[this.hatColor].color).applyToMesh(this.hat);
            }
        }
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
        this._instantiated = true;
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
        ScreenLoger.Log("setWorldPosition " + p);
        this.position.copyFrom(p);
        this.computeWorldMatrix(true);
        this.body.position.copyFrom(p);
        this.body.position.y += this.bodyHeight;
        this.bodyTargetPos.copyFrom(this.body.position);
        this.head.position.copyFrom(p);
        this.head.position.y += this.bodyHeight + 0.5;
        this.feet[0].position.copyFrom(p);
        this.feet[1].position.copyFrom(p);
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
            if (!this.isGrounded) {
                duration *= 0.5;
            }
            let originQ = foot.rotationQuaternion.clone();
            let t0 = performance.now() / 1000;
            let step = () => {
                let t = performance.now() / 1000;
                let f = (t - t0) / duration;
                if (f < 1) {
                    //f = Nabu.Easing.easeInSine(f);
                    BABYLON.Quaternion.SlerpToRef(originQ, targetQ, f, foot.rotationQuaternion);
                    BABYLON.Vector3.LerpToRef(origin, target, f, foot.position);
                    if (this.isGrounded) {
                        foot.position.y += Math.min(dist, this.stepHeight) * Math.sin(f * Math.PI);
                    }
                    else {
                        let paddle = this.forward.clone();
                        paddle.scaleInPlace(0.3 * Math.sin(f * Math.PI));
                        foot.position.addInPlace(paddle);
                    }
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
        if (this.walking === 0 && this.isAlive && !this.jumping) {
            let deltaPos = this.position.subtract(this.body.position);
            let doWalk = false;
            if (deltaPos.length() > 0) {
                doWalk = true;
            }
            else {
                if (Math.abs(this.r - this.bodyR) > Math.PI / 8) {
                    doWalk = true;
                }
            }
            if (doWalk) {
                let xFactor = this.footIndex === 0 ? 1 : -1;
                let spread = 0.2;
                let animatedSpeedForward = BABYLON.Vector3.Dot(this.animatedSpeed, this.forward);
                let animatedSpeedRight = BABYLON.Vector3.Dot(this.animatedSpeed, this.right);
                let origin = new BABYLON.Vector3(xFactor * spread, 0, 0);
                let up = BABYLON.Vector3.Up();
                BABYLON.Vector3.TransformCoordinatesToRef(origin, this.getWorldMatrix(), origin);
                if (!this.jumping) {
                    origin.y += 1;
                    if (this.isPlayerControlled) {
                        let groundedOrigin = origin.clone();
                        groundedOrigin.y = 0;
                        let groundedBody = this.body.absolutePosition.clone();
                        groundedBody.y = 0;
                        let groundedDist = BABYLON.Vector3.Distance(groundedOrigin, groundedBody);
                        if (groundedDist > 0.35) {
                            let dir = groundedOrigin.subtract(groundedBody).normalize();
                            //origin.subtractInPlace(dir.scale(groundedDist - 0.35));
                        }
                    }
                    origin.addInPlace(this.forward.scale(animatedSpeedForward * 0.4)).addInPlace(this.right.scale(animatedSpeedRight * 0.4));
                    //Mummu.DrawDebugPoint(origin, 5, BABYLON.Color3.Red());
                    let ray = new BABYLON.Ray(origin, new BABYLON.Vector3(0, -1, 0), 1.5);
                    let pick = this._scene.pickWithRay(ray, (mesh => {
                        return mesh.name.startsWith("chunck") || mesh instanceof HomeMenuPlate || mesh instanceof ConstructionMesh;
                    }));
                    if (pick.hit) {
                        origin = pick.pickedPoint;
                        up = pick.getNormal(true, false);
                        this.isGrounded = true;
                        let foot = this.feet[this.footIndex];
                        if (BABYLON.Vector3.DistanceSquared(foot.position, origin.add(up.scale(0.0))) > 0.01) {
                            this.walking = 1;
                            let footDir = this.forward.add(this.right.scale(0.5 * xFactor)).normalize();
                            foot.groundPos = origin;
                            foot.groundUp = up;
                            this.animateFoot(foot, origin.add(up.scale(0.0)), Mummu.QuaternionFromYZAxis(up, footDir)).then(() => {
                                this.walking = 0;
                                this.footIndex = (this.footIndex + 1) % 2;
                            });
                        }
                        else {
                            this.footIndex = (this.footIndex + 1) % 2;
                        }
                    }
                    else {
                        this.isGrounded = false;
                    }
                }
                else {
                    this.isGrounded = false;
                }
            }
        }
    }
    static FlatManhattan(from, to) {
        return Math.abs(from.x - to.x) + Math.abs(from.z - to.z);
    }
    jump() {
        if (!this.jumping) {
            this._jumpTimer = 0;
            this.jumping = true;
            this.isGrounded = false;
            this.gravityVelocity = -5;
            setTimeout(() => {
                this.jumping = false;
            }, 800);
        }
    }
    update(dt) {
        if (this.brain) {
            this.brain.update(dt);
        }
        if (Math.random() < 0.01) {
            this.kwak();
        }
        this.walk();
        let dR = this.r - this._lastR;
        this._lastR = this.r;
        this.animatedRSpeed = dR / dt;
        if (this.isGrounded) {
            if (this.isPlayerControlled) {
                this.position.y = Math.min(this.feet[0].position.y, this.feet[1].position.y);
            }
            this.gravityVelocity = 0;
            this._jumpTimer = 0;
        }
        else {
            this._jumpTimer += dt;
            this._jumpingFootTargets[0].copyFromFloats(0.25, 0, 0.3 * Math.cos(this._jumpTimer * 8 * Math.PI));
            this._jumpingFootTargets[1].copyFromFloats(-0.25, 0, -0.3 * Math.cos(this._jumpTimer * 8 * Math.PI));
            BABYLON.Vector3.TransformCoordinatesToRef(this._jumpingFootTargets[0], this.getWorldMatrix(), this._jumpingFootTargets[0]);
            BABYLON.Vector3.TransformCoordinatesToRef(this._jumpingFootTargets[1], this.getWorldMatrix(), this._jumpingFootTargets[1]);
            BABYLON.Vector3.LerpToRef(this.feet[0].position, this._jumpingFootTargets[0], 0.2, this.feet[0].position);
            BABYLON.Vector3.LerpToRef(this.feet[1].position, this._jumpingFootTargets[1], 0.2, this.feet[1].position);
            this.position.y -= this.gravityVelocity * dt;
            this.gravityVelocity += 5 * dt;
        }
        let f = 0.5;
        let halfFeetDistance = BABYLON.Vector3.Distance(this.feet[0].position, this.feet[1].position) * 0.5;
        let totalLegLength = this.upperLegLength + this.lowerLegLength;
        let maxBodyHeight = Math.sqrt(Math.max(0, totalLegLength * totalLegLength - halfFeetDistance * halfFeetDistance)) - this.hipPos.y;
        maxBodyHeight = Math.max(maxBodyHeight, this.foldedBodyHeight);
        this.bodyTargetPos.copyFrom(this.feet[0].position).addInPlace(this.feet[1].position).scaleInPlace(0.5);
        if (this.isGrounded) {
            this.bodyTargetPos.addInPlace(this.animatedSpeed.scale(0.15));
            this.bodyTargetPos.y += Math.min(this.bodyHeight, maxBodyHeight);
        }
        else {
            this.bodyTargetPos.y += Math.min(0.5 * this.bodyHeight, maxBodyHeight);
        }
        Mummu.DrawDebugPoint(this.position, 2, BABYLON.Color3.Blue());
        let altitude = this.game.terrain.worldPosToTerrainAltitude(this.position);
        Mummu.DrawDebugPoint(new BABYLON.Vector3(this.position.x, altitude, this.position.z), 2, BABYLON.Color3.Red());
        let pForce = this.bodyTargetPos.subtract(this.body.position);
        let pForceValue = 80;
        if (!this.isGrounded) {
            pForceValue = 200;
        }
        pForce.scaleInPlace(pForceValue * dt);
        this.bodyVelocity.addInPlace(pForce);
        this.bodyVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.2));
        //if (this.bodyVelocity.length() > this.speed * 3) {
        //    this.bodyVelocity.normalize().scaleInPlace(this.speed * 3);
        //} 
        this.body.position.addInPlace(this.bodyVelocity.scale(dt));
        //this.body.position.copyFrom(this.bodyTargetPos);
        this.updateConstructionDIDJRange();
        for (let di = this._constructionRange.di0; di <= this._constructionRange.di1; di++) {
            for (let dj = this._constructionRange.dj0; dj <= this._constructionRange.dj1; dj++) {
                let construction = this.getCurrentConstruction(di, dj);
                if (construction) {
                    if (construction.mesh) {
                        let col = Mummu.SphereMeshIntersection(this.dodoCollider.absolutePosition, BRICK_S, construction.mesh, true);
                        if (col.hit) {
                            Mummu.DrawDebugHit(col.point, col.normal, 200, BABYLON.Color3.Red());
                            let delta = col.normal.scale(col.depth);
                            this.position.addInPlace(delta);
                            let speedComp = BABYLON.Vector3.Dot(this.animatedSpeed, col.normal);
                            this.animatedSpeed.subtractInPlace(col.normal.scale(speedComp));
                            if (col.normal.y > 0.5) {
                                this.gravityVelocity *= 0.5;
                            }
                        }
                    }
                }
            }
        }
        let right = this.feet[0].position.subtract(this.feet[1].position);
        right.normalize();
        right.addInPlace(this.right.scale(2 + 2 * this.animatedSpeed.length() / this.speed));
        right.normalize();
        this.body.rotationQuaternion = BABYLON.Quaternion.Slerp(this.rotationQuaternion, Mummu.QuaternionFromXYAxis(right, this.up), 0.95);
        this.body.freezeWorldMatrix();
        let hipR = this.hipPos.clone();
        BABYLON.Vector3.TransformCoordinatesToRef(hipR, this.body.getWorldMatrix(), hipR);
        let kneeR = hipR.clone().addInPlace(this.feet[0].position).scaleInPlace(0.5);
        kneeR.subtractInPlace(this.forward);
        kneeR.addInPlace(this.right.scale(0.1));
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.QuaternionFromZYAxisToRef(kneeR.subtract(hipR), hipR.subtract(this.feet[0].position), this.upperLegs[0].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[0].position.subtract(kneeR), hipR.subtract(this.feet[0].position), this.lowerLegs[0].rotationQuaternion);
        this.upperLegs[0].position.copyFrom(hipR);
        this.lowerLegs[0].position.copyFrom(kneeR);
        let hipL = this.hipPos.clone();
        hipL.x = -hipL.x;
        BABYLON.Vector3.TransformCoordinatesToRef(hipL, this.body.getWorldMatrix(), hipL);
        let kneeL = hipL.clone().addInPlace(this.feet[1].position).scaleInPlace(0.5);
        kneeL.subtractInPlace(this.forward);
        kneeL.subtractInPlace(this.right.scale(0.1));
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.QuaternionFromZYAxisToRef(kneeL.subtract(hipL), hipL.subtract(this.feet[1].position), this.upperLegs[1].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[1].position.subtract(kneeL), hipL.subtract(this.feet[1].position), this.lowerLegs[1].rotationQuaternion);
        this.upperLegs[1].position.copyFrom(hipL);
        this.lowerLegs[1].position.copyFrom(kneeL);
        let feetDeltaY = Math.abs(this.feet[0].position.y - this.feet[1].position.y);
        let neck = new BABYLON.Vector3(0, 0, 0);
        neck.copyFrom(this.feet[0].position.scale(f)).addInPlace(this.feet[1].position.scale(1 - f));
        neck.y += this.bodyHeight + 0.51793 - feetDeltaY * 0.25;
        neck.addInPlace(this.body.forward.scale(0.37652));
        neck.copyFrom(this.body.absolutePosition);
        neck.y = this.feet[0].position.y * (f) + this.feet[1].position.y * (1 - f);
        neck.y += this.bodyHeight + 0.51793 - feetDeltaY * 0.25;
        neck.addInPlace(this.body.forward.scale(0.37652));
        let headForce = neck.subtract(this.head.position);
        headForce.scaleInPlace(200 * dt);
        this.headVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.2));
        this.headVelocity.addInPlace(headForce);
        this.head.position.addInPlace(this.headVelocity.scale(dt));
        let forward = this.forward;
        if (this.targetLook) {
            forward.copyFrom(this.targetLook).subtractInPlace(this.head.position).normalize();
        }
        this.head.rotationQuaternion = Mummu.QuaternionFromZYAxis(forward, this.up);
        let db = this.head.absolutePosition.add(this.head.forward.scale(0.5)).subtract(this.bodyTargetPos);
        db.scaleInPlace(2);
        let rComp = this.right.scale(BABYLON.Vector3.Dot(db, this.right));
        db.subtractInPlace(rComp.scale(2));
        let tailPoints = [new BABYLON.Vector3(0, 0.050484, 0.165269), this.head.absolutePosition];
        BABYLON.Vector3.TransformCoordinatesToRef(tailPoints[0], this.body.getWorldMatrix(), tailPoints[0]);
        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward.scale(3), BABYLON.Vector3.Up().scale(2));
        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward.scale(3), BABYLON.Vector3.Up().scale(2));
        let data = Mummu.CreateWireVertexData({
            path: tailPoints,
            radiusFunc: (f) => {
                return 0.2 - 0.15 * f;
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
        if (this.needUpdateCurrentConstruction()) {
            this.updateCurrentConstruction();
        }
    }
    updateConstructionDIDJRange() {
        this._constructionRange.di0 = 0;
        this._constructionRange.di1 = 0;
        this._constructionRange.dj0 = 0;
        this._constructionRange.dj1 = 0;
        let center = this.currentConstructions[1][1];
        if (center) {
            let dx = Math.abs(this.position.x - center.position.x);
            if (dx < Construction.SIZE_m * 0.1) {
                this._constructionRange.di0--;
            }
            if (dx > Construction.SIZE_m * 0.9) {
                this._constructionRange.di1++;
            }
            let dz = Math.abs(this.position.z - center.position.z);
            if (dz < Construction.SIZE_m * 0.15) {
                this._constructionRange.dj0--;
            }
            if (dz > Construction.SIZE_m * 0.85) {
                this._constructionRange.dj1++;
            }
        }
    }
    needUpdateCurrentConstruction() {
        let center = this.currentConstructions[1][1];
        if (!center) {
            return true;
        }
        let dx = Math.abs(this.position.x - center.barycenter.x);
        let dz = Math.abs(this.position.z - center.barycenter.z);
        if (dx > Construction.SIZE_m * 0.5 * 1.1) {
            return true;
        }
        if (dz > Construction.SIZE_m * 0.5 * 1.1) {
            return true;
        }
    }
    getCurrentConstruction(di, dj) {
        if (!this.currentConstructions[1 + di][1 + dj]) {
            let center = this.currentConstructions[1][1];
            if (!center) {
                this.updateCurrentConstruction();
                center = this.currentConstructions[1][1];
            }
            if (center) {
                this.currentConstructions[1 + di][1 + dj] = this.game.terrainManager.getConstruction(center.i + di, center.j + dj);
            }
        }
        return this.currentConstructions[1 + di][1 + dj];
    }
    updateCurrentConstruction() {
        let iConstruction = Math.floor(this.position.x / Construction.SIZE_m);
        let jConstruction = Math.floor(this.position.z / Construction.SIZE_m);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.currentConstructions[i][j] = undefined;
            }
        }
        this.currentConstructions[1][1] = this.game.terrainManager.getConstruction(iConstruction, jConstruction);
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
    async kwak() {
        await this.animateJaw(Math.PI / 6, 0.1);
        await this.animateJaw(0, 0.1);
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
    BrainMode[BrainMode["Player"] = 2] = "Player";
    BrainMode[BrainMode["Network"] = 3] = "Network";
})(BrainMode || (BrainMode = {}));
class Brain {
    constructor(dodo, ...subBrains) {
        this.dodo = dodo;
        this.mode = BrainMode.Idle;
        this.subBrains = [];
        for (let n = 0; n < subBrains.length; n++) {
            let mode = subBrains[n];
            if (mode === BrainMode.Idle) {
                this.subBrains[BrainMode.Idle] = new BrainIdle(this);
            }
            else if (mode === BrainMode.Travel) {
                this.subBrains[BrainMode.Travel] = new BrainTravel(this);
            }
            else if (mode === BrainMode.Player) {
                this.subBrains[BrainMode.Player] = new BrainPlayer(this);
            }
            else if (mode === BrainMode.Network) {
                this.subBrains[BrainMode.Network] = new BrainNetwork(this);
            }
        }
        this.mode = subBrains[0];
    }
    get game() {
        return this.dodo.game;
    }
    get terrain() {
        return this.game.terrain;
    }
    initialize() {
        this.subBrains.forEach(subBrain => {
            subBrain.initialize();
        });
    }
    update(dt) {
        if (this.mode === BrainMode.Idle) {
            if (this.subBrains[BrainMode.Travel]) {
                if (Math.random() < 0.005) {
                    let destination = BABYLON.Vector3.Zero();
                    destination.y += 100;
                    destination.x += -100 + 200 * Math.random();
                    destination.z += -100 + 200 * Math.random();
                    let ray = new BABYLON.Ray(destination, new BABYLON.Vector3(0, -1, 0));
                    let pick = this.dodo.game.scene.pickWithRay(ray, (mesh => {
                        return mesh.name.startsWith("chunck");
                    }));
                    if (pick.hit) {
                        destination = pick.pickedPoint;
                        this.subBrains[BrainMode.Travel].destination = destination;
                        this.subBrains[BrainMode.Travel].onReach = () => {
                            this.mode = BrainMode.Idle;
                        };
                        this.subBrains[BrainMode.Travel].onCantFindPath = () => {
                            this.mode = BrainMode.Idle;
                        };
                        this.mode = BrainMode.Travel;
                    }
                }
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
    get dodo() {
        return this.brain.dodo;
    }
    get game() {
        return this.dodo.game;
    }
    get terrain() {
        return this.game.terrain;
    }
    initialize() {
    }
    update(dt) {
    }
}
/// <reference path="SubBrain.ts"/>
class BrainIdle extends SubBrain {
    constructor() {
        super(...arguments);
        this.positionZero = BABYLON.Vector3.Zero();
        this.positionRadius = 2;
        this._targetPos = BABYLON.Vector3.Zero();
        this._targetR = 0;
        this._targetLook = BABYLON.Vector3.Zero();
        this._speed = 1;
        this._currentCooldown = 0;
        this._currentSkip = 0;
    }
    initialize() {
        this._targetPos.copyFrom(this.positionZero);
    }
    update(dt) {
        this._currentCooldown -= dt;
        if (this._currentCooldown <= 0) {
            let dirToPlayer = this.game.playerDodo.position.subtract(this.dodo.position);
            let distToPlayer = dirToPlayer.length();
            if (distToPlayer < 5) {
                this._targetLook = this.game.playerDodo.head.position;
                if (Mummu.Angle(this.dodo.forward, dirToPlayer) > Math.PI / 3) {
                    this._targetR = Mummu.AngleFromToAround(BABYLON.Axis.Z, dirToPlayer, BABYLON.Axis.Y);
                }
                this._speed = 1;
                this._currentSkip = 0;
            }
            else {
                this._currentSkip--;
                if (this._currentSkip <= 0) {
                    if (Math.random() < 0.5) {
                        this._targetPos.copyFromFloats(0, 0, Math.random() * this.positionRadius);
                        Mummu.RotateInPlace(this._targetPos, BABYLON.Axis.Y, Math.random() * 2 * Math.PI);
                        this._targetPos.addInPlace(this.positionZero);
                    }
                    let dirToLook = new BABYLON.Vector3(0, -3 + 6 * Math.random(), 10);
                    Mummu.RotateInPlace(dirToLook, BABYLON.Axis.Y, this.dodo.r + 0.6 * Math.PI * (Math.random() - 0.5));
                    this._targetLook = dirToLook.add(this.dodo.position);
                    if (Mummu.Angle(this.dodo.forward, dirToLook) > Math.PI / 16) {
                        this._targetR = Mummu.AngleFromToAround(BABYLON.Axis.Z, dirToLook, BABYLON.Axis.Y);
                    }
                    this._speed = 3;
                    this._currentSkip = 8;
                }
            }
            this._currentCooldown = 0.5 * 0.9 + 0.2 * Math.random();
        }
        let f = Nabu.Easing.smoothNSec(1 / dt, 0.3 * this._speed);
        BABYLON.Vector3.LerpToRef(this.dodo.targetLook, this._targetLook, 1 - f, this.dodo.targetLook);
        f = Nabu.Easing.smoothNSec(1 / dt, 1 * this._speed);
        this.dodo.r = Nabu.LerpAngle(this.dodo.r, this._targetR, 1 - f);
        if (BABYLON.Vector3.Distance(this.dodo.position, this._targetPos) > ONE_cm_SQUARED) {
            let f = Nabu.Easing.smoothNSec(1 / dt, 0.1);
            let targetAnimatedSpeed = this._targetPos.subtract(this.dodo.position);
            if (targetAnimatedSpeed.lengthSquared() > 1) {
                targetAnimatedSpeed.normalize();
            }
            BABYLON.Vector3.LerpToRef(this.dodo.animatedSpeed, targetAnimatedSpeed, 1 - f, this.dodo.animatedSpeed);
            Mummu.StepToRef(this.dodo.position, this._targetPos, 1 * dt, this.dodo.position);
        }
        else {
            this.dodo.animatedSpeed.copyFromFloats(0, 0, 0);
        }
    }
}
function IsBrainNetworkData(v) {
    if (v.dodoId) {
        if (isFinite(v.x)) {
            if (isFinite(v.y)) {
                if (isFinite(v.z)) {
                    if (isFinite(v.tx)) {
                        if (isFinite(v.ty)) {
                            if (isFinite(v.tz)) {
                                if (isFinite(v.r)) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}
class BrainNetwork extends SubBrain {
    constructor() {
        super(...arguments);
        this.onReach = () => { };
        this.onCantFindPath = () => { };
    }
    update(dt) {
        let network = this.game.networkManager;
        let dataArray = network.receivedData.get(this.dodo.peerId);
        if (dataArray) {
            let data = dataArray[0];
            if (data) {
                let f = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                let pos = new BABYLON.Vector3(data.x, data.y, data.z);
                BABYLON.Vector3.LerpToRef(this.dodo.position, pos, 1 - f, this.dodo.position);
                let targetLook = new BABYLON.Vector3(data.tx, data.ty, data.tz);
                BABYLON.Vector3.LerpToRef(this.dodo.targetLook, targetLook, 1 - f, this.dodo.targetLook);
                let z = Mummu.Rotate(BABYLON.Axis.Z, BABYLON.Axis.Y, data.r);
                let q = Mummu.QuaternionFromZYAxis(z, BABYLON.Axis.Y);
                BABYLON.Quaternion.SlerpToRef(this.dodo.rotationQuaternion, q, 1 - f, this.dodo.rotationQuaternion);
            }
        }
    }
}
/// <reference path="SubBrain.ts"/>
var PlayMode;
(function (PlayMode) {
    PlayMode[PlayMode["Menu"] = 0] = "Menu";
    PlayMode[PlayMode["Inventory"] = 1] = "Inventory";
    PlayMode[PlayMode["Playing"] = 2] = "Playing";
})(PlayMode || (PlayMode = {}));
class BrainPlayer extends SubBrain {
    constructor(brain) {
        super(brain);
        this._targetQ = BABYLON.Quaternion.Identity();
        this._targetLook = BABYLON.Vector3.Zero();
        this.gamepadInControl = false;
        this._pointerDownX = -100;
        this._pointerDownY = -100;
        this._pointerDown = false;
        this._pointerSmoothness = 0.5;
        this._moveXAxisInput = 0;
        this._moveYAxisInput = 0;
        this._rotateXAxisInput = 0;
        this._rotateYAxisInput = 0;
        this._smoothedRotateXAxisInput = 0;
        this._smoothedRotateYAxisInput = 0;
        this._onPointerDown = (event) => {
            this._pointerDownTime = performance.now();
            this._pointerDownX = event.clientX;
            this._pointerDownY = event.clientY;
            this._pointerDown = true;
            if (this.playMode === PlayMode.Playing) {
                if (this.currentAction) {
                    if (event.button === 0) {
                        if (this.currentAction.onPointerDown) {
                            this.currentAction.onPointerDown();
                        }
                    }
                    else if (event.button === 2) {
                        if (this.currentAction.onRightPointerDown) {
                            this.currentAction.onRightPointerDown();
                        }
                    }
                }
                else {
                    if (event.button === 0) {
                        if (this.defaultAction.onPointerDown) {
                            this.defaultAction.onPointerDown();
                        }
                    }
                    else if (event.button === 2) {
                        if (this.defaultAction.onRightPointerDown) {
                            this.defaultAction.onRightPointerDown();
                        }
                    }
                }
            }
        };
        this._pointerMove = (event) => {
            if (this._pointerDown || this.game.inputManager.isPointerLocked) {
                this.gamepadInControl = false;
                this._rotateXAxisInput += event.movementY / 200;
                this._rotateYAxisInput += event.movementX / 200;
            }
        };
        this._pointerUp = (event) => {
            this._pointerDown = false;
            let dX = this._pointerDownX - event.clientX;
            let dY = this._pointerDownY - event.clientY;
            let onScreenDistance = Math.sqrt(dX * dX + dY * dY);
            let duration = (performance.now() - this._pointerDownTime) / 1000;
            if (this.playMode === PlayMode.Playing) {
                if (this.currentAction) {
                    if (event.button === 0) {
                        if (this.currentAction.onPointerUp) {
                            this.currentAction.onPointerUp(duration, onScreenDistance);
                        }
                    }
                    else if (event.button === 2) {
                        if (this.currentAction.onRightPointerUp) {
                            this.currentAction.onRightPointerUp(duration, onScreenDistance);
                        }
                    }
                }
                else {
                    if (event.button === 0) {
                        if (this.defaultAction.onPointerUp) {
                            this.defaultAction.onPointerUp(duration, onScreenDistance);
                        }
                    }
                    else if (event.button === 2) {
                        if (this.defaultAction.onRightPointerUp) {
                            this.defaultAction.onRightPointerUp(duration, onScreenDistance);
                        }
                    }
                }
            }
        };
        this._wheel = (event) => {
            if (this.currentAction) {
                if (this.currentAction.onWheel) {
                    this.currentAction.onWheel(event);
                }
            }
            else {
                if (this.defaultAction.onWheel) {
                    this.defaultAction.onWheel(event);
                }
            }
        };
        this.inventory = new PlayerInventory(this);
        this.defaultAction = PlayerActionDefault.Create(this);
        this.playerActionManager = new PlayerActionManager(this, this.game);
    }
    get currentAction() {
        return this._currentAction;
    }
    set currentAction(action) {
        if (this._currentAction && this._currentAction.onUnequip) {
            this._currentAction.onUnequip();
        }
        this._currentAction = action;
        if (this._currentAction && this._currentAction.onEquip) {
            this._currentAction.onEquip();
        }
    }
    get playMode() {
        if (this.game.playerInventoryView.shown) {
            return PlayMode.Inventory;
        }
        if (this.game.brickMenuView.shown) {
            return PlayMode.Menu;
        }
        if (this.game.gameMode === GameMode.Playing) {
            return PlayMode.Playing;
        }
        return PlayMode.Menu;
    }
    get scene() {
        return this.game.scene;
    }
    initialize() {
        this.playerActionManager.initialize();
        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION, () => {
            if (this.playMode === PlayMode.Playing) {
                if (this.currentAction) {
                    this.currentAction.onPointerDown();
                }
                else if (this.defaultAction.onPointerDown) {
                    this.defaultAction.onPointerDown();
                }
            }
        });
        for (let slotIndex = 0; slotIndex < 10; slotIndex++) {
            this.game.inputManager.addMappedKeyDownListener(KeyInput.ACTION_SLOT_0 + slotIndex, () => {
                if (this.playerActionManager) {
                    if (slotIndex === this.playerActionManager.currentActionIndex) {
                        this.playerActionManager.toggleEquipAction();
                    }
                    else {
                        this.playerActionManager.setActionIndex(slotIndex);
                        this.playerActionManager.equipAction();
                    }
                }
            });
        }
        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION_EQUIP, () => {
            if (this.playMode === PlayMode.Playing) {
                if (this.playerActionManager) {
                    this.playerActionManager.toggleEquipAction();
                }
            }
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION_DEC, () => {
            if (this.playerActionManager) {
                this.playerActionManager.setActionIndex(this.playerActionManager.prevActionIndex());
            }
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION_INC, () => {
            if (this.playerActionManager) {
                this.playerActionManager.setActionIndex(this.playerActionManager.nextActionIndex());
            }
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY, () => {
            if (this.game.playerInventoryView.shown) {
                this.game.playerInventoryView.hide(0.2);
            }
            else {
                if (this.game.inputManager.isPointerLocked) {
                    document.exitPointerLock();
                    this.game.playerInventoryView.onNextHide = () => {
                        this.game.canvas.requestPointerLock();
                    };
                }
                this.game.playerInventoryView.show(0.2);
            }
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY_PREV_CAT, () => {
            if (this.playMode === PlayMode.Inventory) {
                this.game.playerInventoryView.setCurrentCategory(this.game.playerInventoryView.prevCategory);
            }
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY_NEXT_CAT, () => {
            if (this.playMode === PlayMode.Inventory) {
                this.game.playerInventoryView.setCurrentCategory(this.game.playerInventoryView.nextCategory);
            }
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY_EQUIP_ITEM, async () => {
            if (this.playMode === PlayMode.Inventory) {
                let item = this.game.playerInventoryView.getCurrentItem();
                if (item) {
                    let action = await item.getPlayerAction(this);
                    this.playerActionManager.linkAction(action, this.playerActionManager.currentActionIndex);
                    if (this.playerActionManager.alwaysEquip) {
                        this.playerActionManager.equipAction();
                    }
                }
            }
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_FORWARD, () => { this._moveYAxisInput = 1; });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_BACK, () => { this._moveYAxisInput = -1; });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_RIGHT, () => { this._moveXAxisInput = 1; });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_LEFT, () => { this._moveXAxisInput = -1; });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_FORWARD, () => { this._moveYAxisInput = 0; });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_BACK, () => { this._moveYAxisInput = 0; });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_RIGHT, () => { this._moveXAxisInput = 0; });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_LEFT, () => { this._moveXAxisInput = 0; });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.JUMP, () => { this.dodo.jump(); });
        this.game.canvas.addEventListener("pointerdown", this._onPointerDown);
        this.game.canvas.addEventListener("pointerup", this._pointerUp);
        this.game.canvas.addEventListener("pointermove", this._pointerMove);
        window.addEventListener("wheel", this._wheel);
        this._touchInputLeft = document.querySelector("#touch-input-move");
        this._touchInputLeft.onJoystickChange = (x, y) => {
            this._moveXAxisInput = x;
            this._moveYAxisInput = y;
        };
    }
    update(dt) {
        if (this.game.gameMode === GameMode.Playing) {
            let moveInput = new BABYLON.Vector2(this._moveXAxisInput, this._moveYAxisInput);
            let inputForce = moveInput.length();
            if (inputForce > 1) {
                moveInput.normalize();
            }
            let dir = this.dodo.right.scale(moveInput.x * 0.75).add(this.dodo.forward.scale(moveInput.y * (moveInput.y > 0 ? 1 : 0.75)));
            if (dir.lengthSquared() > 0) {
                let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.2);
                BABYLON.Vector3.LerpToRef(this.dodo.animatedSpeed, dir.scale(this.dodo.speed), 1 - fSpeed, this.dodo.animatedSpeed);
                this.dodo.position.addInPlace(dir.scale(this.dodo.animatedSpeed.length() * dt));
            }
            else {
                let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                this.dodo.animatedSpeed.scaleInPlace(fSpeed);
            }
            if (this.currentAction) {
                this.currentAction.onUpdate();
            }
            else {
                this.defaultAction.onUpdate();
            }
        }
        this._smoothedRotateXAxisInput = this._smoothedRotateXAxisInput * this._pointerSmoothness + this._rotateXAxisInput * (1 - this._pointerSmoothness);
        this._smoothedRotateYAxisInput = this._smoothedRotateYAxisInput * this._pointerSmoothness + this._rotateYAxisInput * (1 - this._pointerSmoothness);
        this._rotateXAxisInput = 0;
        this._rotateYAxisInput = 0;
        this.game.camera.verticalAngle += this._smoothedRotateXAxisInput;
        this.dodo.rotate(BABYLON.Axis.Y, this._smoothedRotateYAxisInput);
        let f = 1;
        if (this.game.gameMode === GameMode.Home) {
            let dir = this.game.camera.globalPosition.subtract(this.dodo.position);
            let angle = Mummu.AngleFromToAround(this.dodo.forward, dir, BABYLON.Axis.Y);
            f = Nabu.Easing.smoothNSec(1 / dt, 1);
            if (Math.abs(angle) < Math.PI / 4) {
                this._targetLook.copyFrom(this.game.camera.globalPosition);
            }
            else {
                let twistAngle = Mummu.Angle(this.dodo.forward, this.dodo.head.forward);
                if (Math.random() < 0.005 || twistAngle > Math.PI / 6) {
                    this._targetLook.copyFrom(this.dodo.position);
                    this._targetLook.addInPlace(this.dodo.forward.scale(4));
                    this._targetLook.x += Math.random() * 2 - 1;
                    this._targetLook.y += Math.random() * 2 - 1;
                    this._targetLook.z += Math.random() * 2 - 1;
                }
            }
        }
        else if (this.game.gameMode === GameMode.Playing) {
            if (this.brain.inDialog) {
                this._targetLook.copyFrom(this.brain.inDialog.dodo.head.absolutePosition);
                f = Nabu.Easing.smoothNSec(1 / dt, 0.3);
            }
            else {
                let aimRay = this.game.camera.getForwardRay(50);
                let pick = this.game.scene.pickWithRay(aimRay, (mesh) => {
                    return mesh instanceof DodoCollider && mesh.dodo != this.dodo;
                });
                if (pick.hit && pick.pickedMesh instanceof DodoCollider) {
                    this._targetLook.copyFrom(pick.pickedMesh.dodo.head.absolutePosition);
                    f = Nabu.Easing.smoothNSec(1 / dt, 0.3);
                }
                else {
                    this._targetLook.copyFrom(aimRay.direction).scaleInPlace(50).addInPlace(aimRay.origin);
                    f = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                }
            }
        }
        BABYLON.Vector3.LerpToRef(this.dodo.targetLook, this._targetLook, 1 - f, this.dodo.targetLook);
    }
}
class BrainTravel extends SubBrain {
    constructor() {
        super(...arguments);
        this.onReach = () => { };
        this.onCantFindPath = () => { };
    }
    update(dt) {
        if (this.destination && this.dodo.lifeState === LifeState.Ok) {
            let dir = this.destination.subtract(this.dodo.position).normalize();
            //let bh = 1.2 - 0.6 * Math.abs(dir.y);
            //this.dodo.bodyHeight = this.dodo.bodyHeight * 0.99 + bh * 0.01;
            let rY = Mummu.AngleFromToAround(this.dodo.forward, dir, BABYLON.Axis.Y);
            let dRY = Nabu.MinMax(rY, -Math.PI / (4 * this.dodo.stepDuration) * dt, Math.PI / (4 * this.dodo.stepDuration) * dt);
            this.dodo.rotate(BABYLON.Axis.Y, dRY);
            let r = BABYLON.Vector3.Cross(BABYLON.Axis.Y, dir);
            let targetUp = BABYLON.Vector3.Cross(dir, r);
            targetUp.normalize();
            let newQ = Mummu.QuaternionFromYZAxis(targetUp, this.dodo.forward);
            BABYLON.Quaternion.SlerpToRef(this.dodo.rotationQuaternion, newQ, 0.01, this.dodo.rotationQuaternion);
            let speedFactor = 1;
            if (Math.abs(rY) > Math.PI / 4) {
                speedFactor = 1 - Math.abs(rY - Math.sign(rY) * Math.PI / 4) / (3 * Math.PI / 4);
            }
            speedFactor = speedFactor * speedFactor;
            let speed = speedFactor * this.dodo.speed;
            this.dodo.position.addInPlace(dir.scale(speed * dt));
            let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.5);
            BABYLON.Vector3.LerpToRef(this.dodo.animatedSpeed, dir.scale(speed), 1 - fSpeed, this.dodo.animatedSpeed);
            BABYLON.Vector3.SlerpToRef(this.dodo.targetLook, this.destination.add(new BABYLON.Vector3(0, 1, 0)), 0.005, this.dodo.targetLook);
            //Mummu.DrawDebugPoint(this.dodo.targetLook, 5, BABYLON.Color3.Red());
            let distToNext = BABYLON.Vector3.Distance(this.dodo.position, this.destination);
            if (distToNext < 2) {
                if (this.onReach) {
                    this.onReach();
                    return;
                }
            }
        }
        else {
            let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.1);
            this.dodo.animatedSpeed.scaleInPlace(fSpeed);
        }
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
class NPCDialogResponse {
    constructor(text, lineIndex) {
        this.text = text;
        this.lineIndex = lineIndex;
    }
}
class NPCDialogLine {
    constructor(index) {
        this.index = index;
    }
}
class NPCDialogTextLine extends NPCDialogLine {
    constructor(index, text, ...responses) {
        super(index);
        this.text = text;
        this.responses = [];
        this.responses.push(...responses);
    }
}
class NPCDialogCheckLine extends NPCDialogLine {
    constructor(index, check) {
        super(index);
        this.check = check;
    }
}
class NPCDialog {
    constructor(dodo, dialogLines = []) {
        this.dodo = dodo;
        this.dialogLines = dialogLines;
        this.dialogTimeout = 0;
    }
    get game() {
        return this.dodo.game;
    }
    getLine(index) {
        let line = this.dialogLines.find(line => { return line.index === index; });
        if (line) {
            return line;
        }
        return this.dialogLines.find(line => { return line.index === 1000; });
    }
    async writeLine(dialogLine) {
        if (this.linesContainer) {
            if (dialogLine instanceof NPCDialogTextLine) {
                let lineElement = document.createElement("div");
                lineElement.classList.add("dialog-line");
                lineElement.innerHTML = "<span class='text'>— " + dialogLine.text + "</span>";
                this.linesContainer.appendChild(lineElement);
                this.linesContainer.scroll({ top: 1000, behavior: "smooth" });
                if (dialogLine.responses.length > 0) {
                    setTimeout(() => {
                        let responsesElements = [];
                        for (let n = 0; n < dialogLine.responses.length; n++) {
                            let response = dialogLine.responses[n];
                            let responseElement = document.createElement("div");
                            responseElement.classList.add("dialog-response-line");
                            responseElement.innerHTML = "<span class='index'>" + (n + 1).toFixed(0) + "</span><span class='text'>" + response.text + "</span>";
                            this.linesContainer.appendChild(responseElement);
                            this.linesContainer.scroll({ top: 1000, behavior: "smooth" });
                            responseElement.onclick = () => {
                                responsesElements.forEach(e => {
                                    if (e === responseElement) {
                                        e.classList.add("selected");
                                    }
                                    else {
                                        e.classList.add("rejected");
                                    }
                                    e.onclick = undefined;
                                });
                                if (response.lineIndex >= 0) {
                                    this.writeLine(this.getLine(response.lineIndex));
                                }
                                else {
                                    this.stop();
                                }
                            };
                            responsesElements[n] = responseElement;
                        }
                    }, 1000);
                }
                else {
                    setTimeout(() => {
                        this.writeLine(this.getLine(dialogLine.index + 1));
                    }, 1000);
                }
            }
            else if (dialogLine instanceof NPCDialogCheckLine) {
                let result = await dialogLine.check();
                this.writeLine(this.getLine(result));
            }
            else {
                this.stop();
            }
        }
    }
    start() {
        this.game.playerBrain.inDialog = this;
        this.container = document.querySelector("#dialog-container");
        this.container.style.display = "block";
        this.linesContainer = document.querySelector("#dialog-lines-container");
        let title = document.querySelector("#dialog-container .dialog-title");
        title.innerHTML = this.dodo.name.toLocaleUpperCase();
        this.writeLine(this.dialogLines[0]);
    }
    stop() {
        this.game.playerBrain.inDialog = undefined;
        if (this.container) {
            this.container.style.display = "none";
        }
        if (this.linesContainer) {
            this.linesContainer.innerHTML = "";
        }
        if (this.onNextStop) {
            this.onNextStop();
            this.onNextStop = undefined;
        }
    }
}
class NPCManager {
    constructor(game) {
        this.game = game;
        //232a0f200101
    }
    initialize() {
        this.landServant = new Dodo("local-npc", "Boadicea Bipin", this.game, { style: "232a0f200101" });
        this.landServant.brain = new Brain(this.landServant, BrainMode.Idle);
        this.landServant.brain.subBrains[BrainMode.Idle].positionZero = new BABYLON.Vector3(1.25, 0, 25.56);
        this.landServant.brain.initialize();
        this.brickMerchant = new Dodo("brick-merchant", "Agostinho Timon", this.game, { style: "232a0f200101" });
        this.brickMerchant.brain = new Brain(this.brickMerchant, BrainMode.Idle);
        this.brickMerchant.brain.subBrains[BrainMode.Idle].positionZero = new BABYLON.Vector3(6.66, 0.53, 1.37);
        this.brickMerchant.brain.initialize();
    }
    async instantiate() {
        await this.landServant.instantiate();
        this.landServant.unfold();
        this.landServant.setWorldPosition(new BABYLON.Vector3(1.25, 0, 25.56));
        this.game.npcDodos.push(this.landServant);
        this.landServant.brain.npcDialog = new NPCDialog(this.landServant, [
            new NPCDialogTextLine(0, "Good Morning Sir !"),
            new NPCDialogTextLine(1, "I am Boadicea Bipin, Head of the Departement of Urbanism and Land Survey."),
            new NPCDialogTextLine(2, "Do you wish to build on a terrain parcel ?", new NPCDialogResponse("Yes, I would like to build something.", 3), new NPCDialogResponse("No, thanks.", 100)),
            new NPCDialogTextLine(3, "Do you know the building rules in Dodopolis ?", new NPCDialogResponse("Yes, but I would love to hear it again.", 4), new NPCDialogResponse("No, what are the rules ?", 4)),
            new NPCDialogTextLine(4, "Don't let my top hat fool you, I will not sell you Land."),
            new NPCDialogTextLine(5, "In Dodopolis, the Land belongs to every Dodo."),
            new NPCDialogTextLine(6, "You may only borrow it, for as long as you wish."),
            new NPCDialogTextLine(7, "And once you no longer use the Land, another Dodo will enjoy it."),
            new NPCDialogTextLine(8, "'From each according to his ability, to each according to his needs'."),
            new NPCDialogTextLine(9, "Do you want to use a parcel ?", new NPCDialogResponse("Yes", 10), new NPCDialogResponse("No", 100)),
            new NPCDialogCheckLine(10, async () => {
                try {
                    const response = await fetch(SHARE_SERVICE_PATH + "get_available_constructions", {
                        method: "GET",
                        mode: "cors"
                    });
                    let responseText = await response.text();
                    if (responseText) {
                        let response = JSON.parse(responseText);
                        let availableConstruction = response.constructions;
                        if (availableConstruction[0]) {
                            let i = availableConstruction[0].i;
                            let j = availableConstruction[0].j;
                            let constructionData = await this.game.networkManager.claimConstruction(i, j);
                            if (!constructionData) {
                                return 40;
                            }
                            if (constructionData.i != i || constructionData.j != j) {
                                return 30;
                            }
                            return 20;
                        }
                        else {
                            return 40;
                        }
                    }
                }
                catch (e) {
                    console.error(e);
                    ScreenLoger.Log("buildFromServer error");
                    ScreenLoger.Log(e);
                }
                return 40;
            }),
            new NPCDialogTextLine(20, "You can now use your parcel, have fun !"),
            new NPCDialogTextLine(30, "You already have a parcel assigned, don't be greedy."),
            new NPCDialogTextLine(40, "Something went wrong but I don't know what."),
            new NPCDialogTextLine(1000, "Have a nice day !", new NPCDialogResponse("Thanks, bye !", -1))
        ]);
        await this.brickMerchant.instantiate();
        this.brickMerchant.unfold();
        this.brickMerchant.setWorldPosition(this.brickMerchant.brain.subBrains[BrainMode.Idle].positionZero);
        this.game.npcDodos.push(this.brickMerchant);
        this.brickMerchant.brain.npcDialog = new NPCDialog(this.brickMerchant, [
            new NPCDialogTextLine(0, "Good Morning Sir !"),
            new NPCDialogTextLine(1, "My name is Agostinho Timon. I make sure every Dodo get a fair share of construction material."),
            new NPCDialogTextLine(2, "Do you want some construction blocks ?", new NPCDialogResponse("Yes, I would like to build something.", 10), new NPCDialogResponse("No, thanks.", 100)),
            new NPCDialogCheckLine(10, async () => {
                for (let n = 0; n < 5; n++) {
                    let brickIndex = Math.floor(BRICK_LIST.length * Math.random());
                    this.game.playerBrainPlayer.inventory.addItem(new PlayerInventoryItem(BRICK_LIST[brickIndex], InventoryCategory.Brick, this.game));
                }
                return 1000;
            }),
            new NPCDialogTextLine(1000, "Here you go, have fun with your Blocks, see you soon !", new NPCDialogResponse("Thanks, bye !", -1))
        ]);
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
