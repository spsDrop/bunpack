import { BuildOutput } from "bun";
import { existsSync } from "fs";
import { basename } from "path";

export async function patchSourceMaps(build: BuildOutput) {
    await Promise.all(build.outputs.map(async (output) => {
        const sourcemapPath = output.path + '.map';
        if (existsSync(sourcemapPath)) {
            const outputContent = await output.text()
            if (!outputContent.match("//# sourceMappingURL=")) {
                const patchedOutput = outputContent + `\n//# sourceMappingURL=${basename(sourcemapPath)}`
                Bun.write(output.path, patchedOutput)
            }
        }
    }));
}
