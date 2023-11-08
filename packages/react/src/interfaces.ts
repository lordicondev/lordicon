/**
 * Icon data in JSON format. This player is optimized to handle icons from [Lordicon](https://lordicon.com/).
 */
export type IconData = any;

/**
 * Animation direction supported by the {@link IPlayer | player instance}. "1" plays the animation forward, and "-1" plays the animation in reverse.
 */
export type AnimationDirection = 1 | -1;

/**
 * Animation state details.
 */
export interface IState {
  name: string;
  time: number;
  duration: number;
  default?: boolean;
}

export interface IPlayerOptions {
  /**
   * Icon data.
   */
  icon: IconData;

  /**
   * Icon size.
   */
  size?: number;

  /**
   * State.
   */
  state?: string;

  /**
   * Replaces the colors of icon with another color.
   */
  colorize?: string;

  /**
   * Animation direction.
   */
  direction?: AnimationDirection;

  /**
   * Render mode.
   */
  renderMode?: "AUTOMATIC" | "HARDWARE" | "SOFTWARE";

  /**
   * Player is ready.
   * @returns
   */
  onReady?: () => void;

  /**
   * Animation completes.
   * @returns
   */
  onComplete?: () => void;
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
   * Go to the first animation frame.
   */
  goToFirstFrame(): void;

  /**
    * Go to the last animation frame.
    */
  goToLastFrame(): void;

  /**
   * The 'frames' property provides the value of the animation length in terms of the number of frames.
   */
  readonly frames: number;

  /**
   * The player is currently playing the animation.
   */
  readonly isPlaying: boolean;

  /**
    * The 'states' property provides a list of supported states by a processed icon.
    */
  readonly states: IState[];

  /**
   * Access to the current state.
   */
  readonly currentState?: IState;
}