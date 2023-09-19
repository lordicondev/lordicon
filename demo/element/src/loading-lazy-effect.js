import { defineElement } from "@lordicon/element";
import lottie from "lottie-web";

document.querySelectorAll("lord-icon").forEach((element) => {
    element.addEventListener("ready", () => {
        element.classList.add("ready");
    });
});

defineElement(lottie.loadAnimation);
