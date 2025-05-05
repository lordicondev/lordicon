import { IPlayer, ITrigger } from '../interfaces';

const NUMBER_REGEX = /^\d*(\.\d+)?$/
const MUTATION_OBSERVER_CONFIG = { attributes: true, childList: false, subtree: false };

/**
 * The __Sequence__ trigger allows you to define complex playing scenarios with a simple definition.
 * 
 * Example usage:
 * ```html
 * <lord-icon trigger="sequence" sequence="state:intro-empty,play,state:hover-empty,play,state:morph-fill,play,state:morph-erase,play,state:intro-empty,delay:first:last:500,play:reverse" src="/trash.json"></lord-icon>
 * ```
 */
export class Sequence implements ITrigger {
    protected sequenceIndex: number = 0;
    protected frameState: string | null = null;
    protected frameDelayFirst: number | null = null;
    protected frameDelayLast: number | null = null;
    protected timer: any;
    protected observer: MutationObserver;

    constructor(
        protected player: IPlayer,
        protected element: HTMLElement,
        protected targetElement: HTMLElement,
    ) {
        this.observer = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'attributes' && ['sequence', 'speed'].includes(mutation.attributeName!)) {
                    this.reset();
                    this.step();
                }
            }
        });
    }

    onReady() {
        this.step();
    }

    onComplete() {
        this.timer = setTimeout(() => {
            this.timer = null;
            this.frameDelayLast = null;

            this.step();
        }, this.frameDelayLast || 0);
    }

    onConnected() {
        this.observer.observe(this.element, MUTATION_OBSERVER_CONFIG);

        this.player.speed = this.speed;
    }

    onDisconnected() {
        this.observer.disconnect();

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.player.speed = 1;
    }

    reset() {
        this.player.pause();
        this.player.speed = this.speed;
        this.sequenceIndex = 0;
        this.frameState = this.frameDelayFirst = this.frameDelayLast = null;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    takeStep() {
        const steps = this.sequence.split(',');

        const step = steps[this.sequenceIndex];

        this.sequenceIndex++;
        if (this.sequenceIndex >= steps.length) {
            this.sequenceIndex = 0;
        }

        const [action, ...params] = step.split(':');

        return { action, params };
    }

    handleStep(action: string, params: string[]) {
        if (action === 'play') {
            if (this.frameState) {
                this.player.state = this.frameState;
                this.frameState = null;
            }

            const hasReverse = params.includes('reverse');
            if (hasReverse) {
                this.player.goToLastFrame();
                this.player.direction = -1;
            } else {
                this.player.goToFirstFrame();
                this.player.direction = 1;
            }

            this.timer = setTimeout(() => {
                this.timer = null;
                this.frameDelayFirst = null;

                this.player.play();
            }, this.frameDelayFirst || 0);
        } else if (action === 'frame') {
            let frameIndex = 0;
            if (params.length && params[0].match(NUMBER_REGEX)) {
                frameIndex = Math.max(0, Math.min(this.player.frames, +params[0]));
            }

            this.player.frame = frameIndex;

            this.timer = setTimeout(() => {
                this.timer = null;
                this.frameDelayFirst = null;

                this.step();
            }, this.frameDelayFirst || 0);
        } else if (action === 'state') {
            this.frameState = params[0];

            this.step();
        } else if (action === 'delay') {
            let value: number | null = null;

            for (const param of params) {
                if (param && param.match(NUMBER_REGEX)) {
                    value = +param;
                }
            }

            if (value && value > 0) {
                if (params.includes('first') && params.includes('last')) {
                    this.frameDelayFirst = value;
                    this.frameDelayLast = value;
                } else if (params.includes('first')) {
                    this.frameDelayFirst = value;
                } else if (params.includes('last')) {
                    this.frameDelayLast = value;
                } else {
                    this.frameDelayFirst = value;
                }
            }

            this.step();
        } else if (action === 'idle') {
            // do nothing
        } else {
            throw new Error(`Invalid sequence action: ${action}`);
        }
    }

    step() {
        const { action, params } = this.takeStep();

        if (!action) {
            return;
        }

        this.handleStep(action, params);
    }

    get sequence() {
        return this.element.getAttribute('sequence') || '';
    }

    get speed() {
        return this.element.hasAttribute('speed') ? +(this.element.getAttribute('speed') || 1) : 1;
    }
}