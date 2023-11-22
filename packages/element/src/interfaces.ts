/**
 * Icon data in JSON format. This player is optimized to handle icons from [Lordicon](https://lordicon.com/).
 */
export type IconData = any;

/**
 * Supported event types by {@link IPlayer | player}.
 */
export type PlayerEventName = 'ready' | 'refresh' | 'complete' | 'frame';

/**
 * Callback type for {@link IPlayer | player}.
 */
export type PlayerEventCallback = () => void;

/**
 * Callback with a custom icon loader. Allows the {@link element.Element | Element} to load {@link IconData | icon data} from a custom source.
 * Remember to assign the _icon loader_ before defining the `lord-icon` custom element to take effect.
 * 
 * Example:
 * ```js
 * import lottie from 'lottie-web';
 * import { defineElement, Element } from '@lordicon/element';
 * 
 * Element.setIconLoader(async (name) => {
 *     const response = await fetch(`https://example.com/${name}.json`);
 *     return await response.json();
 * });
 * 
 * defineElement(lottie.loadAnimation);
 * ```
 * 
 * @param name Icon name.
 */
export type IconLoader = (name: string) => Promise<IconData>;

/**
 * Defines the callback that will create a {@link IPlayer | player instance} on demand for the {@link element.Element | Element}.
 * 
 * Some use cases for providing your own player factory:
 * 
 * - Consider abandoning the use of {@link index.defineElement | defineElement} due to the potential redundancy of default triggers. In this case, assign the player factory before defining the custom element.
 * - Enables the provision of a custom (user-defined) {@link IPlayer | player} implementation. 
 * 
 * Example:
 * ```js
 * import lottie from 'lottie-web';
 * import { Element, Player } from '@lordicon/element';
 * 
 * Element.setPlayerFactory((container, iconData) => {
 *     return new Player(
 *         lottie.loadAnimation,
 *         container,
 *         iconData,
 *     );
 * });
 * 
 * customElements.define("lord-icon", Element);
 * ```
 */
export type PlayerFactory = (container: HTMLElement, iconData: IconData, initial: IProperties) => IPlayer;

/**
 * Animation direction supported by the {@link IPlayer | player instance}. "1" plays the animation forward, and "-1" plays the animation in reverse.
 */
export type AnimationDirection = 1 | -1;

/**
 * Supported stroke values.
 */
export type Stroke = 1 | 2 | 3 | 'light' | 'regular' | 'bold';

/**
 * Interface for an object that stores multiple colors.
 * 
 * Example:
 * ```js
 * {
 *     primary: 'red',
 *     secondary: '#ff0000', 
 * }
 * ```
 */
export interface IColors {
    [key: string]: string;
}

/**
 * Interface for an object with customizable properties supported by the {@link IPlayer | player}.
 * 
 * Note: Not every icon supports all of these properties. It usually depends on the icon family.
 * 
 * Example:
 * ```js
 * {
 *     stroke: 'bold',
 *     colors: {
 *         primary: 'red',
 *     },
 * }
 * ```
 */
export interface IProperties {
    /**
     * Stroke.
     */
    stroke?: Stroke;

    /**
     * State (motion type) of the icon. States allow switching between multiple animations contained within a single icon file.
     */
    state?: string;

    /**
     * Colors.
     */
    colors?: IColors;

    /**
     * Scale for legacy icons.
     */
    scale?: number;

    /**
     * Axis x for legacy icons.
     */
    axisX?: number;

    /**
     * Axis y for legacy icons.
     */
    axisY?: number;
}

/**
 * Animation state details.
 */
export interface IState {
    name: string;
    time: number;
    duration: number;
    default?: boolean;
}

/**
 * Interface for an animation player.
 * Provides a simple API to control animations and customize icon properties dynamically.
 */
export interface IPlayer {
    /**
     * Connect the player with the element.
     */
    connect(): void;

    /**
     * Disconnect the player from the element.
     */
    disconnect(): void;

    /**
     * Start listening for an event.
     * @param name Event name.
     * @param callback Event callback.
     */
    addEventListener(name: PlayerEventName, callback: PlayerEventCallback): () => void;

    /**
     * Stop listening for an event.
     * @param name Event name.
     * @param callback Event callback.
     */
    removeEventListener(name: PlayerEventName, callback?: PlayerEventCallback): void;

    /**
     * Play the animation. 
     * 
     * Note: A finished animation can't be played again from the last frame.
     */
    play(): void;

    /**
     * Play the animation from the beginning.
     */
    playFromBeginning(): void;

    /**
     * Pause the animation.
     */
    pause(): void;

    /**
     * Stop the animation.
     */
    stop(): void;

    /**
     * Go to the exact frame.
     * @param frame Frame number.
     */
    goToFrame(frame: number): void;

    /**
     * Go to the first animation frame.
     */
    goToFirstFrame(): void;

    /**
     * Go to the last animation frame.
     */
    goToLastFrame(): void;

    /**
     * Access to read or modify multiple properties at once. Resets to default any properties that are not provided.
     * 
     * @param properties Properties to assign.
     */
    properties: IProperties;

    /**
     * This property allows you to discover customizable colors or update them within a processed icon.
     * 
     * Example (list all supported colors by the icon):
     * ```js
     * { ...iconElement.playerInstance.colors }
     * ```
     * 
     * Example (update a single color):
     * ```js
     * iconElement.playerInstance.colors.primary = '#ff0000';
     * ```
     * 
     * Example (update multiple colors at once):
     * ```js
     * iconElement.playerInstance.colors = { primary: 'red', secondary: 'blue' };
     * ```
     * 
     * Example (reset all colors to default):
     * ```js
     * iconElement.playerInstance.colors = null;
     * ```
     */
    colors: IColors | null;

    /**
     * The 'stroke' property gives you the value of the icon's stroke width.
     */
    stroke: Stroke | null;

    /**
     * This property allows you to control the state (motion type) of the icon.
     * States enable switching between multiple animations built into a single icon file.
     */
    state: string | null;

    /**
     * This property allows you to control the speed of the icon animation.
     */
    speed: number;

    /**
     * Access the player frame. You can manually control the animation playback by changing this frame.
     */
    frame: number;

    /**
     * The 'direction' property lets you influence the direction of the animation playback, whether it plays forward (1) or in reverse (-1).
     */
    direction: AnimationDirection;

    /**
     * This property allows you to control whether the player should loop the animation.
     */
    loop: boolean;

    /**
     * The player is ready.
     */
    readonly isReady: boolean;

    /**
     * The player is currently playing the animation.
     */
    readonly isPlaying: boolean;

    /**
     * The 'states' property provides a list of supported states by a processed icon.
     */
    readonly states: IState[];

    /**
     * The 'frames' property provides the value of the animation length in terms of the number of frames.
     */
    readonly frames: number;

    /**
     * The 'duration' property provides the value of the animation length in seconds.
     */
    readonly duration: number;
}

/**
 * Interface for triggers. Triggers provide interaction chains that can be handled by {@link element.Element | Element}. 
 * Implement this interface when creating a new trigger.
 * You can access the current _player_, _element_, and _targetElement_ from the trigger's {@link interfaces.ITriggerConstructor | constructor}.
 * 
 * Example:
 * ```js
 * import lottie from 'lottie-web';
 * import { defineElement, Element } from '@lordicon/element';
 * 
 * class Custom {
 *     player;
 *     element;
 *     targetElement;
 * 
 *     constructor(player, element, targetElement) {
 *         this.player = player;
 *         this.element = element;
 *         this.targetElement = targetElement;
 *     }
 * 
 *     onReady() {
 *         this.player.play();
 *     }
 * }
 * 
 * Element.defineTrigger('custom', Custom);
 * 
 * defineElement(lottie.loadAnimation);
 * ```
 */
export interface ITrigger {
    /**
     * The trigger has been connected to the {@link element.Element | Element}.
     */
    onConnected?: () => void;

    /**
     * The trigger has been disconnected from the {@link element.Element | Element}.
     * 
     * Note: Remember to remove any potential event listeners you assigned earlier in this trigger.
     */
    onDisconnected?: () => void;

    /**
     * The {@link interfaces.IPlayer | player} is ready. Now you can control the animation and icon properties with it.
     */
    onReady?: () => void;

    /**
     * The {@link interfaces.IPlayer | player} was refreshed, for example, due to icon customization.
     */
    onRefresh?: () => void;

    /**
     * The {@link interfaces.IPlayer | player} has completed an animation.
     */
    onComplete?: () => void;

    /**
     * The {@link interfaces.IPlayer | player} has rendered a frame.
     */
    onFrame?: () => void;
}

/**
 * Definition of a supported trigger constructor.
 */
export interface ITriggerConstructor {
    /**
     * @param player Player instance.
     * @param element Our custom element. 
     * @param targetElement Target element for events listening.
     */
    new(player: IPlayer, element: HTMLElement, targetElement: HTMLElement): ITrigger;
}