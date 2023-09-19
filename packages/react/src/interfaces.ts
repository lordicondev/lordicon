/**
 * Icon data in JSON format. This player is optimized to handle icons from [Lordicon](https://lordicon.com/).
 */
export type IconData = any;

/**
 * Animation direction supported by player. "1" plays animation forward and "-1" plays the animation in reverse.
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
 * Provides a simple API to control animations and customize icon properties on the fly.
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
   * Play animation. 
   * 
   * Notice: finished animation can't be played again on the last frame.
   */
  play(): void;

  /**
   * Play animation from beginning.
   */
  playFromBeginning(): void;

  /**
   * Pause animation.
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
   * Frames give you the value of animation length in a number of frames.
   */
  readonly frames: number;

  /**
   * The player is playing animation.
   */
  readonly isPlaying: boolean;

  /**
   * States give you the list of supported states by a processed icon.
   */
  readonly states: IState[];

  /**
   * Access to current state.
   */
  readonly currentState?: IState;
}