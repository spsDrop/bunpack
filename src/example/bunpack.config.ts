import { BunpackConfig } from "../types";

export default {
    buildConfig:{
        entrypoints: ['./src/index.ts'],
        outdir: './public',
    },
    devServer: {
        port: 8080,
        watchDir: './src',
        https: true,
    }
} as BunpackConfig