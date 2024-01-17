import { TLSOptions } from "bun";

export type BunBuildConfig = Parameters<typeof Bun.build>[0];

export interface BunpackConfig{
    buildConfig: BunBuildConfig,
    devServer: {
        watchDir: string,
        port: number,
        host: string
        tls?: TLSOptions,
        https: boolean, // webpack style auto gen keys
    }
}
