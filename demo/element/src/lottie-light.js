import { Element, Player, Loop } from "@lordicon/element";

Element.setPlayerFactory((container, iconData, initial) => {
  return new Player(lottie.loadAnimation, container, iconData, initial);
});

Element.defineTrigger("loop", Loop);

customElements.define("lord-icon", Element);
