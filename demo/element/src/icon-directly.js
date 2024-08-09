import { Element, defineElement } from "@lordicon/element";
import lottie from "lottie-web";

async function loadIcon(iconName) {
  const response = await fetch(`/icons/${iconName}.json`);
  return await response.json();
}

const icons = [
  await loadIcon("lock"),
  await loadIcon("puzzle"),
]

const element = document.querySelector("lord-icon");

// Register element.
defineElement(lottie.loadAnimation);

// index of current icon
let index = 0;

// assigning before defining a custom element using this setter is also possible, but it's not recommended
element.iconData = icons[index];

// change icon every 2 seconds
setInterval(() => {
  index += 1;
  if (index >= icons.length) {
    index = 0;
  }
  element.iconData = icons[index];
}, 2000);