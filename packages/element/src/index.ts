import { Element } from './element';
import { IProperties, IconData } from './interfaces';
import { AnimationLoader, Player } from './player';
import { Boomerang, Click, Hover, In, Loop, LoopOnHover, Morph, Sequence } from './triggers';

export { Boomerang, Click, Element, Hover, In, Loop, LoopOnHover, Morph, Player, Sequence };

export * from "./interfaces";

/**
 * Helper method that defines the `lord-icon` custom element with pre-made triggers and a {@link interfaces.PlayerFactory | player factory}.
 * 
 * This method defines the following triggers:
 * - {@link triggers/in.In | in}
 * - {@link triggers/click.Click | click}
 * - {@link triggers/hover.Hover | hover}
 * - {@link triggers/loop.Loop | loop}
 * - {@link triggers/loop-on-hover.LoopOnHover | loop-on-hover}
 * - {@link triggers/morph.Morph | morph}
 * - {@link triggers/boomerang.Boomerang | boomerang}
 * - {@link triggers/sequence.Sequence | sequence}
 *
 * Example of tag definition with the default setup:
 * ```js
 * import lottie from 'lottie-web';
 * import { defineElement } from '@lordicon/element';
 * 
 * defineElement(lottie.loadAnimation);
 * ```
 * 
 * Basic usage from markup which is possible after tag definition:
 * ```html
 * <lord-icon trigger="hover" src="/icons/confetti.json"></lord-icon>
 * ```
 * 
 * @param animationLoader Use `loadAnimation` from the `lottie-web` package.
 */
export function defineElement(animationLoader: AnimationLoader) {
    Element.setPlayerFactory((container: HTMLElement, iconData: IconData, initial: IProperties) => {
        return new Player(
            animationLoader,
            container,
            iconData,
            initial,
        );
    });

    Element.defineTrigger('in', In);
    Element.defineTrigger('click', Click);
    Element.defineTrigger('hover', Hover);
    Element.defineTrigger('loop', Loop);
    Element.defineTrigger('loop-on-hover', LoopOnHover);
    Element.defineTrigger('morph', Morph);
    Element.defineTrigger('boomerang', Boomerang);
    Element.defineTrigger('sequence', Sequence);

    if (!customElements.get || !customElements.get('lord-icon')) {
        customElements.define('lord-icon', Element);
    }
}