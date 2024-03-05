import { BunpackConfig } from "../src/types";

export default {
    esbuildBundleConfig:{
        bundle: true,
        metafile: true,
        entryPoints: ['./src/index.ts'],
        outdir: './public',
        sourcemap: "external",
        external: [""],
        entryNames: "[name].[hash]",
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