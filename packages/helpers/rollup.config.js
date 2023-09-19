import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/index.ts",
    output: {
        sourcemap: true,
        dir: "dist",
        format: "es",
        plugins: [terser()],
    },
    plugins: [typescript()],
};
