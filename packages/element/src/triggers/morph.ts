import { IPlayer, ITrigger } from '../interfaces';

/**
 * The __Morph__ trigger allows playing the animation from the first to the last frame when hovering or clicking on the icon. After moving or clicking away, the animation plays in reverse.
 */
export class Morph implements ITrigger {
    constructor(
        protected player: IPlayer,
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
    ) {
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    onConnected() {
        this.targetElement.addEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.addEventListener('mouseleave', this.onMouseLeave);
    }

    onDisconnected() {
        this.targetElement.removeEventListener('mouseenter', this.onMouseEnter);
        this.targetElement.removeEventListener('mouseleave', this.onMouseLeave);

        this.player.direction = 1;
    }

    onMouseEnter() {
        this.player.direction = 1;
        this.player.play();
    }

    onMouseLeave() {
        this.player.direction = -1;
        this.player.play();
    }
}