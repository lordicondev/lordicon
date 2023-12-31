import { Element, defineElement } from "@lordicon/element";
import lottie from "lottie-web";

// List of supported icons by our icon loader.
const ICONS = {
  first: "/icons/lock.json",
  second: "/icons/puzzle.json",
};

// Custom icon loader which can provide icon data from any place you want.
// In this example our loader fetch icon data from provided url.
Element.setIconLoader(async (iconName) => {
  const response = await fetch(ICONS[iconName]);
  return await response.json();
});

// Register element.
defineElement(lottie.loadAnimation);
