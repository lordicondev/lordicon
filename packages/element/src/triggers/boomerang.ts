import { IPlayer, ITrigger } from '../interfaces';

/**
 * The __Boomerang__ trigger plays the animation from the first to the last frame when you hover over it and then plays in reverse once you move the cursor away.
 */
export class Boomerang implements ITrigger {
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

        this.player.direction = 1;
    }

    onComplete() {
        this.player.direction = -1;
        this.player.play();
    }

    onHover() {
        this.player.direction = 1;
        this.player.play();
    }
}