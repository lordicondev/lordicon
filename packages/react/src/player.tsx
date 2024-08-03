import { isNil } from '@lordicon/helpers';
import lottie, { AnimationConfig, AnimationItem } from 'lottie-web';
import React from 'react';
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
        fill: currentColor;
    }

    :host(.colorize) svg path[stroke] {
        stroke: currentColor;
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
    protected  _root?: ShadowRoot;
    
    protected _lottie?: AnimationItem;
    
    constructor(props: Options) {
        super(props);

        this._ref = React.createRef<HTMLDivElement>();
    }

    connect() {
        if (!this.props.icon) {
            return;
        }

        this._states = (this.props.icon.markers || []).map((c: any) => {
            const [partA, partB] = c.cm.split(':');
            const newState: IState = {
                time: c.tm,
                duration: c.dr,
                name: partB || partA,
                default: partB && partA.includes('default') ? true : false,
            };

            if (newState.name === this.props.state) {
                this._state = newState;
            } else if (newState.default && isNil(this.props.state)) {
                this._state = newState;
            }

            return newState;
        });
        
        if (this._states.length) {
            const firstState = this._states[0];
            const lastState = this._states[this._states.length - 1];

            // fix animation time
            this.props.icon.ip = firstState.time;
            this.props.icon.op = lastState.time + lastState.duration + 1;
        }

        const container: any = this._root!.lastElementChild;
        const initialOptions: LottieOptions = {};

        if (this._state) {
            initialOptions.initialSegment = [this._state.time, this._state.time + this._state.duration + 1];
        }

        this._lottie = lottie.loadAnimation({
            container,
            animationData: this.props.icon,
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

        if (prevProps.icon !== this.props.icon) {
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