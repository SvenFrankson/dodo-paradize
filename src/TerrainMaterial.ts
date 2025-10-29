class TerrainMaterial extends BABYLON.ShaderMaterial {

    private _lightInvDirW: BABYLON.Vector3 = BABYLON.Vector3.Up();

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "terrainToon",
                fragment: "terrainToon",
            },
            {
                attributes: ["position", "normal", "uv", "uv2", "color"],
                uniforms: [
                    "world", "worldView", "worldViewProjection", "view", "projection",
                    "lightInvDirW"
                ]
            }
        );

        this.setLightInvDir(BABYLON.Vector3.One().normalize());
        this.setColor3("grassColor", BABYLON.Color3.FromHexString("#7c8d4c"));
        this.setColor3("dirtColor", BABYLON.Color3.FromHexString("#725428"));
        this.setColor3("sandColor", BABYLON.Color3.FromHexString("#f0f0b5"));

        this.setColor3("grassColor", BABYLON.Color3.FromHexString("#5ab552"));
        this.setColor3("dirtColor", BABYLON.Color3.FromHexString("#6e4c30"));
        this.setColor3("sandColor", BABYLON.Color3.FromHexString("#e8d282"));
    }

    public getLightInvDir(): BABYLON.Vector3 {
        return this._lightInvDirW;
    }

    public setLightInvDir(p: BABYLON.Vector3): void {
        this._lightInvDirW.copyFrom(p);
        this.setVector3("lightInvDirW", this._lightInvDirW);
    }
}