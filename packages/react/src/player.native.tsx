import { ILottieProperty, isNil } from '@lordicon/helpers';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, Easing, View } from 'react-native';
import { handleProps } from './helpers';
import { AnimationDirection, IPlayer, IPlayerOptions, IState } from './interfaces';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

type PlayerState = {
    progress?: Animated.Value;
}

interface IAnimation {
    animation: Animated.CompositeAnimation;
    from: number;
    to: number;
    direction: AnimationDirection;
}

type Options = IPlayerOptions & View['props'];

export class Player extends React.Component<Options, PlayerState> implements IPlayer {
    protected _states: IState[] = [];
    protected _state?: IState;
    protected _playing: boolean = false;
    protected _animation?: IAnimation;
    protected _progress: number = 0;
    protected _iconData: any;
    protected _properties: ILottieProperty[] = [];
    
    constructor(props: Options) {
        super(props);
        
        const { iconData, states, state, properties } = handleProps(props);

        this._iconData = iconData;
        this._states = states;
        this._state = state;
        this._properties = properties;

        this.state = { 
            progress: new Animated.Value(1),
        };

        this.state.progress!.addListener(({ value }) => {
            this._progress = value;
        });
    }

    connect() {
        if (!this._iconData) {
            return;
        }

        this.goToFirstFrame();
        this.onReady();
    }

    disconnect() {
        if (this._animation) {
            this._animation.animation.stop();
            this._animation = undefined;
        }
    }

    componentDidMount() {
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

    frameToProgress(frame: number) {
        return frame / this._totalFrames;
    }

    progressToFrame(progress: number) {
        return progress * this._totalFrames;
    }

    duration(frames: number) {
        return frames * this._fr;
    }

    onFinish(isCancelled: boolean) {
        this._playing = false;

        if (this._animation && !isCancelled) {
            this._animation = undefined;
        }

        if (!isCancelled) {
            this.props.onComplete?.();
        }
    }

    onDirectionChanged() {
        if (!this._animation) {
            return;
        }

        const isPlaying = this._playing;

        this._animation.animation.stop();
        const animation = Animated.timing(this.state.progress!, {
            toValue: this.frameToProgress(this._animation.from),
            duration: this.duration(Math.abs(this.progressToFrame(this._progress) - this._animation.from)),
            useNativeDriver: false,
            easing: Easing.linear,
        });

        this._animation = {
            animation,
            from: this._animation.to,
            to: this._animation.from,
            direction: this.props.direction || 1,
        };

        if (isPlaying) {
            this._playing = true;

            animation.start(({ finished }: { finished: boolean }) => {
                this.onFinish(!finished);
            });
        }
    }

    onStateChanged() {
        const isPlaying = this.isPlaying;

        this._state = undefined;

        if (isNil(this.props.state)) {
            this._state = this._states.filter(c => c.default)[0];
        } else if (this.props.state) {
            this._state = this._states.filter(c => c.name === this.props.state)[0];
        }

        this.playFromBeginning();
        this.pause()

        if (isPlaying) {
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
        if (this._animation) {
            this._playing = true;

            this._animation.animation.start(({ finished }: { finished: boolean }) => {
                this.onFinish(!finished);
            });
        } else {
            this._playing = true;

            const a: number = this._state ? this._state!.time : 0;
            const b: number = this._state ? (this._state!.time + this._state!.duration) : this._totalFrames;
            const c: number[] = this.props.direction === -1 ? [b, a] : [a, b];
            const duration = this.duration(Math.abs(b - a));

            if (this.progressToFrame(this._progress).toFixed(4) === c[1].toFixed(4)) {
                this.onFinish(false);
                return;
            }
            
            this.state.progress?.setValue(this.frameToProgress(c[0]));
    
            const animation = Animated.timing(this.state.progress!, {
                toValue: this.frameToProgress(c[1]),
                duration,
                useNativeDriver: false,
                easing: Easing.linear,
            });
    
            animation.start(({ finished }: { finished: boolean }) => {
                this.onFinish(!finished);
            });
    
            this._animation = {
                animation,
                from: c[0],
                to: c[1],
                direction: this.props.direction || 1,
            };
        }
    }

    playFromBeginning() {
        this._playing = true;

        const a = this._state ? this._state!.time : 0;
        const b = this._state ? (this._state!.time + this._state!.duration) : this._totalFrames;
        const c = [a, b];
        const duration = this.duration(Math.abs(b - a));
        
        this.state.progress?.setValue(this.frameToProgress(c[0]));

        const animation = Animated.timing(this.state.progress!, {
            toValue: this.frameToProgress(c[1]),
            duration,
            useNativeDriver: false,
            easing: Easing.linear,
        });

        animation.start(({ finished }: { finished: boolean }) => {
            this.onFinish(!finished);
        });

        this._animation = {
            animation,
            from: c[0],
            to: c[1],
            direction: this.props.direction || 1,
        };
    }

    pause() {
        if (this._animation) {
            this._animation.animation.stop();
        }
    }

    goToFirstFrame() {
        const p = this._state ? this._state!.time : 0;
        this.state.progress?.setValue(this.frameToProgress(p));
    }

    goToLastFrame() {
        const p = this._state ? (this._state.time + this._state.duration) : 0;
        this.state.progress?.setValue(this.frameToProgress(p));
    }

    render() {
        const size = this.props.size || 32;

        return (
            <View style={[{
                width: size,
                height: size,
                aspectRatio: 1,
                flexDirection: 'row',
            }, this.props.style]}>
                <AnimatedLottieView  
                    style={[{flex: 1}]} 
                    autoPlay={false}
                    loop={false}
                    progress={this.state.progress}
                    source={this._iconData}
                    renderMode={this.props.renderMode}
                    cacheComposition={false}
                    colorFilters={ this.props.colorize ? [{ keypath: '*', color: this.props.colorize } ] : undefined }
                />
            </View>
        );
    }    
    
    get frames() {
        return this._state?.duration || this._totalFrames;
    }

    get isPlaying() {
        return this._playing;
    }

    get states() {
        return this._states;
    }

    get currentState() {
        return this._state;
    }

    get _totalFrames() {
        return this._iconData.op - 1;
    }

    get _fr() {
        return 1000 / this._iconData.fr;
    }
}
