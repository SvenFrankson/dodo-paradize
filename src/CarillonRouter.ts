class CarillonRouter extends Nabu.Router {
    public playUI: Nabu.DefaultPage;
    public editorUI: Nabu.DefaultPage;
    public creditsPage: Nabu.DefaultPage;
    public devPage: Nabu.DefaultPage;
    public eulaPage: Nabu.DefaultPage;

    public timerText: HTMLDivElement;
    public puzzleIntro: HTMLDivElement;
    
    public playBackButton: HTMLButtonElement;

    constructor(public game: Game) {
        super();
    }

    public async postInitialize(): Promise<void> {
        //await RandomWait();
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }

        this.creditsPage = document.querySelector("#credits-page") as Nabu.DefaultPage;
        this.playUI = document.querySelector("#play-ui") as Nabu.DefaultPage;
        this.editorUI = document.querySelector("#editor-ui") as Nabu.DefaultPage;
        this.devPage = document.querySelector("#dev-page") as Nabu.DefaultPage;
        this.eulaPage = document.querySelector("#eula-page") as Nabu.DefaultPage;
        
        this.playBackButton = document.querySelector("#play-ui .back-btn") as HTMLButtonElement;
        this.timerText = document.querySelector("#play-timer");
        this.puzzleIntro = document.querySelector("#puzzle-intro");
    }

    protected onUpdate(): void {}

    protected async onHRefChange(page: string, previousPage: string): Promise<void> {
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
