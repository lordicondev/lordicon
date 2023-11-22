import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";

import packageDetails from "./package.json";

export default [
    {
        input: ["src/index.ts"],
        output: {
            sourcemap: true,
            dir: "dist",
            format: "es",
            plugins: [terser()],
        },
        plugins: [
            replace({
                __BUILD_VERSION__: packageDetails.version,
                preventAssignment: true,
            }),
            typescript(),
            nodeResolve(),
        ],
    },
    {
        input: ["src/release.ts"],
        output: {
            entryFileNames: "lordicon.js",
            sourcemap: false,
            dir: "release",
            format: "iife",
            plugins: [terser()],
        },
        plugins: [
            replace({
                __BUILD_VERSION__: packageDetails.version,
                preventAssignment: true,
            }),
            typescript({
                outDir: "release",
                declaration: false,
                compilerOptions: {
                    sourceMap: false,
                }
            }),
            nodeResolve(),
            commonjs(),
        ],
        onwarn(warning, warn) {
            if (warning.code === "EVAL") return;
            warn(warning);
        },
    },
];
