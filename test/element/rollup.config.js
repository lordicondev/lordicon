import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";

export default {
    input: ["src/index.js"],
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
                { src: "images/**/*", dest: "dist/images" },
                { src: "src/**/*.html", dest: "dist" },
                { src: "src/**/*.css", dest: "dist" },
                {
                    src: "../../node_modules/lottie-web/build/player/lottie_svg.min.js",
                    dest: "dist",
                },
                {
                    src: "../../node_modules/chai/chai.js",
                    dest: "dist",
                },
                {
                    src: "../../node_modules/mocha/mocha.js",
                    dest: "dist",
                },
                {
                    src: "../../node_modules/mocha/mocha.css",
                    dest: "dist",
                },
                {
                    src: "../../node_modules/resemblejs/resemble.js",
                    dest: "dist",
                },
                {
                    src: "../../node_modules/base-64/base64.js",
                    dest: "dist",
                },
                {
                    src: "../../packages/element/dist/index.js",
                    dest: "dist",
                    rename: "lordicon.js",
                },
            ],
        }),
    ],
    onwarn(warning, warn) {
        if (warning.code === "EVAL") return;
        warn(warning);
    },
};
