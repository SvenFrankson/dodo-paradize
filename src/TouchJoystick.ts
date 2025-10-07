class TouchJoystick extends HTMLElement {

    private _x: number = 0;
    private _y: number = 0;

    public get x(): number {
        return this._x;
    }
    public get y(): number {
        return this._y;
    }

    private _upPath: SVGPathElement;
    private _rightPath: SVGPathElement;
    private _bottomPath: SVGPathElement;
    private _leftPath: SVGPathElement;

    private _touchInputDown: boolean;

    public connectedCallback(): void {
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
        
        this.addEventListener("pointerdown", (ev: PointerEvent) => {
            this._touchInputDown = true;
            let rect = this.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;
            let s = rect.width;
            this.setX((x / s - 0.5) * 2);
            this.setY(- ((y / s - 0.5) * 2));
            
            ev.preventDefault();
        });

        this.addEventListener("pointerup", (ev: PointerEvent) => {
            this._touchInputDown = false;
            this.setX(0);
            this.setY(0);
            
            ev.preventDefault();
        });

        this.addEventListener("pointerleave", (ev: PointerEvent) => {
            this._touchInputDown = false;
            this.setX(0);
            this.setY(0);
            
            ev.preventDefault();
        });

        this.addEventListener("pointermove", (ev: PointerEvent) => {
            if (this._touchInputDown) {
                let rect = this.getBoundingClientRect();
                let x = ev.clientX - rect.left;
                let y = ev.clientY - rect.top;
                let s = rect.width;
                this.setX((x / s - 0.5) * 2);
                this.setY(- ((y / s - 0.5) * 2));
            }
        });
    }

    public setX(x: number): void {
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

    public setY(y: number): void {
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

    public onJoystickChange = (x: number, y: number) => {
        
    }
}

customElements.define("touch-joystick", TouchJoystick);