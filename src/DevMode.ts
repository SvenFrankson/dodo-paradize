class DevMode {

    public activated: boolean = false;

    public getPassword(): string {
        return (document.querySelector("#password-value") as HTMLInputElement).value;
    }

    constructor(public game: Game) {

    }

    public activate(): void {
        this.activated = true;
    }

    public deactivate(): void {
        this.activated = false;
    }

    public initialize(): void {
        if (location.host.startsWith("127.0.0.1")) {
            //this.activated = true;
        }
    }
}