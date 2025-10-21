class DevMode {

    public activated: boolean = false;

    public getPassword(): string {
        return "Crillion";
    }

    constructor(public game: Game) {

    }

    public initialize(): void {
        if (location.host.startsWith("127.0.0.1")) {
            this.activated = true;
        }
    }
}