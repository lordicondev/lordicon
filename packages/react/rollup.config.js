import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";

export default [
    {
        input: ["src/player.tsx", "src/player.native.tsx"],
        output: {
            sourcemap: true,
            dir: "dist",
            format: "es",
            preserveModules: false,
            plugins: [terser()],
        },
        plugins: [
            typescript(),
            copy({
                targets: [
                    { src: "src/index.ts", dest: "dist", rename: "index.js" },
                    { src: "src/index.ts", dest: "dist", rename: "index.d.ts" },
                ],
            }),
        ],
        external: [
            "@lordicon/helpers",
            "react/jsx-runtime",
            "react",
            "react-native",
            "lottie-react-native",
            "lottie-web",
        ],
    },
];
