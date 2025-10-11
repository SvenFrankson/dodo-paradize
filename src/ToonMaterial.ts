class ToonMaterial extends BABYLON.ShaderMaterial {

    private _whiteTexture: BABYLON.Texture;
    private _blackTexture: BABYLON.Texture;

    constructor(name: string, public scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "toon",
                fragment: "toon",
            },
            {
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
            }
        );

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

    public dispose(forceDisposeEffect?: boolean, forceDisposeTextures?: boolean, notBoundToMesh?: boolean): void {
        super.dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
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
    }

    private _useVertexColor: boolean = false;
    public get useVertexColor(): boolean {
        return this._useVertexColor;
    }
    public setUseVertexColor(b: boolean) {
        this._useVertexColor = b;
        this.updateUseVertexColor();
    }
    public updateUseVertexColor(): void {
        this.setInt("useVertexColor", this._useVertexColor ? 1 : 0);
    }

    private _useLightFromPOV: boolean = false;
    public get useLightFromPOV(): boolean {
        return this._useLightFromPOV;
    }
    public setUseLightFromPOV(b: boolean) {
        this._useLightFromPOV = b;
        this.updateUseLightFromPOV();
    }
    public updateUseLightFromPOV(): void {
        this.setInt("useLightFromPOV", this._useLightFromPOV ? 1 : 0);
    }

    private _autoLight: number = 0;
    public get autoLight() {
        return this._autoLight;
    }
    public setAutoLight(v: number) {
        this._autoLight = v;
        this.updateAutoLight();
    }
    public updateAutoLight(): void {
        this.setFloat("autoLight", this._autoLight);
    }

    private _diffuseSharpness: number = 0;
    public get diffuseSharpness() {
        return this._diffuseSharpness;
    }
    public setDiffuseSharpness(v: number) {
        this._diffuseSharpness = v;
        this.updateDiffuseSharpness();
    }
    public updateDiffuseSharpness(): void {
        this.setFloat("diffuseSharpness", this._diffuseSharpness);
    }

    private _diffuse: BABYLON.Color3 = BABYLON.Color3.White();
    public get diffuse(): BABYLON.Color3 {
        return this._diffuse;
    }
    public setDiffuse(c: BABYLON.Color3) {
        this._diffuse = c;
        this.updateDiffuse();
    }
    public updateDiffuse(): void {
        this.setColor3("diffuse", this._diffuse);
    }

    private _diffuseCount: number = 4;
    public get diffuseCount() {
        return this._diffuseCount;
    }
    public setDiffuseCount(v: number) {
        this._diffuseCount = v;
        this.updateDiffuseCount();
    }
    public updateDiffuseCount(): void {
        this.setFloat("diffuseCount", this._diffuseCount);
    }

    private _diffuseTexture: BABYLON.Texture;
    public get diffuseTexture(): BABYLON.Texture {
        return this._diffuseTexture;
    }
    public setDiffuseTexture(t: BABYLON.Texture): void {
        this._diffuseTexture = t;
        this.updateDiffuseTexture();
    }
    public updateDiffuseTexture(): void {
        if (this._diffuseTexture) {
            this.setTexture("diffuseTexture", this._diffuseTexture);
        }
        else {
            this.setTexture("diffuseTexture", this._whiteTexture);
        }
    }

    private _normalTexture: BABYLON.Texture;
    public get normalTexture(): BABYLON.Texture {
        return this._normalTexture;
    }
    public setNormalTexture(t: BABYLON.Texture): void {
        this._normalTexture = t;
        this.updateNormalTexture();
    }
    public updateNormalTexture(): void {
        if (this._normalTexture) {
            this.setTexture("normalTexture", this._normalTexture);
        }
        else {
            this.setTexture("normalTexture", this._blackTexture);
        }
    }

    public get alpha() {
        return this._alpha;
    }
    public setAlpha(v: number) {
        this._alpha = v;
        this.updateAlpha();
    }
    public updateAlpha(): void {
        if (this.alpha != 1) {
            this.alphaMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        }
        else {
            this.alphaMode = BABYLON.Material.MATERIAL_OPAQUE;
        }
        this.setFloat("alpha", this._alpha);
    }

    private _useFlatSpecular: boolean = false;
    public get useFlatSpecular(): boolean {
        return this._useFlatSpecular;
    }
    public setUseFlatSpecular(b: boolean) {
        this._useFlatSpecular = b;
        this.updateUseFlatSpecular();
    }
    public updateUseFlatSpecular(): void {
        this.setInt("useFlatSpecular", this._useFlatSpecular ? 1 : 0);
    }

    private _specularIntensity: number = 0;
    public get specularIntensity() {
        return this._specularIntensity;
    }
    public setSpecularIntensity(v: number) {
        this._specularIntensity = v;
        this.updateSpecularIntensity();
    }
    public updateSpecularIntensity(): void {
        this.setFloat("specularIntensity", this._specularIntensity);
    }

    private _specular: BABYLON.Color3 = BABYLON.Color3.White();
    public get specular(): BABYLON.Color3 {
        return this._specular;
    }
    public setSpecular(c: BABYLON.Color3) {
        this._specular = c;
        this.updateSpecular();
    }
    public updateSpecular(): void {
        this.setColor3("specular", this._specular);
    }

    private _specularCount: number = 1;
    public get specularCount() {
        return this._specularCount;
    }
    public setSpecularCount(v: number) {
        this._specularCount = v;
        this.updateSpecularCount();
    }
    public updateSpecularCount(): void {
        this.setFloat("specularCount", this._specularCount);
    }

    private _specularPower: number = 4;
    public get specularPower() {
        return this._specularPower;
    }
    public setSpecularPower(v: number) {
        this._specularPower = v;
        this.updateSpecularPower();
    }
    public updateSpecularPower(): void {
        this.setFloat("specularPower", this._specularPower);
    }
}