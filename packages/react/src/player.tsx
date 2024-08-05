import { ILottieProperty, isNil, lottieColorToHex } from '@lordicon/helpers';
import lottie, { AnimationConfig, AnimationItem } from 'lottie-web';
import React from 'react';
import { handleProps } from './helpers';
import { IPlayer, IPlayerOptions, IState } from './interfaces';

type LottieOptions = Omit<AnimationConfig, 'container'>;

type PlayerState = {}

type Options = IPlayerOptions;

const DEFAULT_LOTTIE_WEB_OPTIONS: Omit<AnimationConfig, 'container'> = {
    renderer: "svg",
    loop: false,
    autoplay: false,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
        hideOnTransparent: true,
    },
}

const ELEMENT_STYLE = `
    :host {
        position: relative;
        display: block;
        transform: translate3d(0px, 0px, 0px);
        width: 100%;
        aspect-ratio: 1/1;
        overflow: hidden;
    }

    :host(.colorize) svg path[fill] {
        fill: var(--lord-icon-colorize, currentColor);
    }

    :host(.colorize) svg path[stroke] {
        stroke: var(--lord-icon-colorize, currentColor);
    }

    svg {
        position: absolute;
        pointer-events: none;
        display: block;
        transform: unset!important;
    }

    ::slotted(*) {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    .body.ready ::slotted(*) {
        display: none;
    }
`;

/**
 * Current style sheet instance (if supported).
 */
let styleSheet: CSSStyleSheet;

export class Player extends React.Component<Options, PlayerState> implements IPlayer {
    protected _ref?: React.RefObject<HTMLDivElement>;
    
    protected _states: IState[] = [];
    protected _state?: IState;
    protected _root?: ShadowRoot;
    protected _iconData: any;
    protected _properties: ILottieProperty[] = [];
    
    protected _lottie?: AnimationItem;
    
    constructor(props: Options) {
        super(props);

        const { iconData, states, state, properties } = handleProps(props);

        this._iconData = iconData;
        this._states = states;
        this._state = state;
        this._properties = properties;

        this._ref = React.createRef<HTMLDivElement>();
    }

    connect() {
        if (!this._iconData) {
            return;
        }
        
        const container: any = this._root!.lastElementChild;

        // support css variables
        const colors = this._properties.filter(c => c.type === 'color');
        if (colors.length) {
            let styleContent = '';
            for (const color of colors) {
                const key = color.name;
                const value = lottieColorToHex(color.value);

                styleContent += `
                    :host(:not(.colorize)) svg path[fill].${key} {
                        fill: var(--lord-icon-${key}, var(--lord-icon-${key}-base, ${value}));
                    }
        
                    :host(:not(.colorize)) svg path[stroke].${key} {
                        stroke: var(--lord-icon-${key}, var(--lord-icon-${key}-base, ${value}));
                    }
                `
            }

            const style = document.createElement("style");
            style.innerHTML = styleContent;
            container!.appendChild(style);
        }

        const initialOptions: LottieOptions = {};

        if (this._state) {
            initialOptions.initialSegment = [this._state.time, this._state.time + this._state.duration + 1];
        }

        this._lottie = lottie.loadAnimation({
            container,
            animationData: this._iconData,
            ...initialOptions,
            ...DEFAULT_LOTTIE_WEB_OPTIONS,
        });

        this._lottie!.setDirection(this.props.direction || 1);

        this._lottie.addEventListener('complete', (e) => {
            this.onFinish();
        });

        if (this._lottie.isLoaded) {
            this.onReady();
        } else {
            this._lottie.addEventListener('config_ready', () => {
                this.onReady();
            });
        }
    }

    disconnect() {
        if (!this._lottie) {
            return;
        }

        this._lottie.destroy();
        this._lottie = undefined;
    }

    componentDidMount() {
        if (!this._root) {
            this._root = this._ref?.current!.attachShadow({
                mode: "open"
            })!;
    
            // stylesheet
            if (!styleSheet) {
                styleSheet = new CSSStyleSheet();
                styleSheet.replaceSync(ELEMENT_STYLE);
            }

            this._root.adoptedStyleSheets = [styleSheet];
            
            // create container
            const container = document.createElement("div");
            container.classList.add('body');
            this._root.appendChild(container);
        }
   
        this.connect();
    }

    componentWillUnmount() {
        this.disconnect();
    }

    componentDidUpdate(prevProps: Options, prevState: PlayerState) {
        if (prevProps.state !== this.props.state) {
            this.onStateChanged();
        }

        if (prevProps.direction !== this.props.direction) {
            this.onDirectionChanged();
        }

        if (prevProps.icon !== this.props.icon || prevProps.colors !== this.props.colors) {
            this.onIconChanged();
        }
    }

    onFinish() {
        this.props.onComplete?.();
    }

    onDirectionChanged() {
        this._lottie!.setDirection(this.props.direction!);
    }

    onStateChanged() {
        const isPlaying = this.isPlaying;

        this._state = undefined;

        if (isNil(this.props.state)) {
            this._state = this._states.filter(c => c.default)[0];
        } else if (this.props.state) {
            this._state = this._states.filter(c => c.name === this.props.state)[0];
        }

        if (this._state) {
            this._lottie?.setSegment(this._state.time, this._state.time + this._state.duration + 1);
        } else {
            this._lottie!.resetSegments(true);
        }

        this.goToFirstFrame();

        if (isPlaying) {
            this.pause();
            this.play();
        }
    }

    onIconChanged() {
        const { iconData, states, state, properties } = handleProps(this.props);

        this._iconData = iconData;
        this._states = states;
        this._state = state;
        this._properties = properties;

        this.disconnect();
        this.connect();
    }

    onReady() {
        this.props.onReady?.();
    }

    play() {
        this._lottie!.play();
    }

    playFromBeginning() {
        if (this._state) {
            const a = this._state.time;
            const b = this._state.time + this._state.duration + 1;
            const c: [number, number] = [a, b];

            this._lottie!.playSegments(c, true);
        } else {
            this._lottie!.goToAndPlay(0);
        }
    }

    pause() {
        this._lottie!.pause();
    }

    goToFirstFrame() {
        this.goToFrame(0);
    }

    goToLastFrame() {
        this.goToFrame(Math.max(0, this.frames));
    }

    goToFrame(frame: number) {
        this._lottie!.goToAndStop(frame, true);
    }

    refresh() {
        this._lottie?.renderer.renderFrame(null);
    }

    render() {
        const size: number = this.props.size || 32;
        const color: string|undefined = this.props.colorize || undefined;
        
        return (
            <div ref={this._ref} className={this.props.colorize ? 'colorize' : undefined} style={{width: size, height: size, color, aspectRatio: 1, flexDirection: 'row'}}></div>
        );
    }

    get frames() {
        return this._lottie!.getDuration(true) - 1;
    }

    get isPlaying() {
        return !this._lottie!.isPaused;
    }

    get states() {
        return this._states;
    }

    get currentState() {
        return this._state;
    }
}