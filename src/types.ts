export type BunBuildConfig = Parameters<typeof Bun.build>[0];

export interface BunServeConfig{
    buildConfig: BunBuildConfig,
    devServer: {
        watchDir: string,
        port: number,
        host: string
    }
}
