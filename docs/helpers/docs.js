const TypeDoc = require("typedoc");

async function main() {
    const app = await TypeDoc.Application.bootstrapWithPlugins({
        name: "@lordicon/helpers",
        entryPointStrategy: "expand",
        entryPoints: ["../../packages/helpers/src/index.ts"],
        hideGenerator: true,
        includes: "includes",
        customCss: "lordicon.css",
        theme: "default",
        excludeProtected: true,
        excludePrivate: true,
    });

    const project = await app.convert();

    if (project) {
        const outputDir = "dist";

        await app.generateDocs(project, outputDir);
        await app.generateJson(project, outputDir + "/documentation.json");
    }
}

main().catch(console.error);
