import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";

export default {
  input: [
    "src/css-variables.js",
    "src/custom-trigger-in-screen.js",
    "src/custom-trigger-scroll.js",
    "src/custom-trigger-states.js",
    "src/custom-trigger.js",
    "src/icon-loader.js",
    "src/loading-lazy-effect.js",
    "src/loading-placeholder.js",
    "src/lottie-light.js",
    "src/manual-control.js",
    "src/state.js",
    "src/triggers.js",
    "src/upload.js",
    "src/legacy.js",
  ],
  output: {
    sourcemap: true,
    dir: "dist",
    format: "es",
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    copy({
      targets: [
        { src: "icons/**/*", dest: "dist/icons" },
        { src: "src/**/*.html", dest: "dist" },
        { src: "src/**/*.css", dest: "dist" },
        {
          src: "../../packages/element/release/*",
          dest: "dist",
        },
        {
          src: "../../node_modules/lottie-web/build/player/lottie_light.min.js",
          dest: "dist",
        },
      ],
    }),
  ],
  onwarn(warning, warn) {
    if (warning.code === "EVAL") return;
    warn(warning);
  },
};
