import { BunpackConfig } from "../src/types";

export default {
    buildConfig:{
        entrypoints: ['./src/index.ts'],
        outdir: './public',
        sourcemap: "external",
        external: [""],
        naming: "[name].[hash].[ext]",
        patchSourceMaps: true,
        htmlTemplate: {
            templatePath:'./src/index.html',
            templateOutputPath: "./index.html"
        }
    },
    devServer: {
        port: 8080,
        watchDir: './src',
        https: true,
    }
} as BunpackConfig