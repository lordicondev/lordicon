import { IPlayer, ITrigger } from '../interfaces';

/**
 * The __Hover__ trigger plays the animation from the first to the last frame when the cursor hovers over the icon (target).
 */
export class Hover implements ITrigger {
    constructor(
        protected player: IPlayer,
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
    ) {
        this.onHover = this.onHover.bind(this);
    }

    onConnected() {
        this.targetElement.addEventListener('mouseenter', this.onHover);
    }

    onDisconnected() {
        this.targetElement.removeEventListener('mouseenter', this.onHover);
    }

    onHover() {
        if (this.player.isPlaying) {
            return;
        }

        this.player.playFromBeginning();
    }
}