# bunpack
A super light weight implementation of the basic function of webpack/vite as a UI development tool

Setup:

```bash
bun add -D bunpack
```

To run:

```bash
bunx bunpack-serve // In the same directory of your bunpack.config.ts
bunx bunpack-build // In the same directory of your bunpack.config.ts
bunx bunpack-serve -c ./some/path/to/bunpack.config.ts
```

```typescript
export interface BunpackConfig{
    buildConfig: BunBuildConfig, // bun build config
    devServer: {
        watchDir: string,
        port: number,
        host: string
    }
}
```
