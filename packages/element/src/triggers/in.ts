import { IPlayer, ITrigger } from '../interfaces';

/**
 * The __In__ trigger plays the animation when the icon (target) is within the user's viewport.
 */
export class In implements ITrigger {
    protected playTimeout: any = null;
    protected played: boolean = false;
    protected intersectionObserver: IntersectionObserver | undefined;

    constructor(
        protected player: IPlayer,
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
    ) {
    }

    onConnected() {
        if (this.loading) {
            this.play();
        } else {
            const callback: IntersectionObserverCallback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.play();

                        this.resetIntersectionObserver();
                    }
                });
            };

            this.intersectionObserver = new IntersectionObserver(callback);
            this.intersectionObserver.observe(this.element);
        }
    }

    onDisconnected() {
        this.played = false;

        this.resetIntersectionObserver();
        this.resetPlayDelayTimer();
    }

    play() {
        if (this.played) {
            return;
        }

        this.played = true;

        this.resetPlayDelayTimer();

        if (this.delay > 0) {
            this.playTimeout = setTimeout(() => {
                this.player.playFromBeginning();
                this.playTimeout = null;
            }, this.delay)
        } else {
            this.player.playFromBeginning();
        }
    }

    resetIntersectionObserver() {
        if (!this.intersectionObserver) {
            return;
        }

        this.intersectionObserver.unobserve(this.element);
        this.intersectionObserver = undefined;
    }

    resetPlayDelayTimer() {
        if (!this.playTimeout) {
            return;
        }

        clearTimeout(this.playTimeout);
        this.playTimeout = null;
    }

    get delay() {
        const value = this.element.hasAttribute('delay') ? +(this.element.getAttribute('delay') || 0) : 0;
        return Math.max(value, 0);
    }

    get loading() {
        return this.element.hasAttribute('loading');
    }
}