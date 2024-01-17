import { mkdirSync, unlinkSync } from "fs";
import path from "path";

const KEY_DIR = '.cache'
const KEY_PATH = path.join(KEY_DIR, 'key.pem');
const CSR_PATH = path.join(KEY_DIR, 'csr.pem');
const CERT_PATH = path.join(KEY_DIR, 'cert.pem');

export async function createKeys(host = 'localhost') {
    const keyFile = Bun.file(KEY_PATH);
    const certFile = Bun.file(CERT_PATH);

    if (!(await keyFile.exists()) || !(await certFile.exists())) {
        mkdirSync(KEY_DIR);

        Bun.spawnSync(`openssl genrsa -out ${KEY_PATH}`.split(' '));
        Bun.spawnSync(`openssl req -new -key ${KEY_PATH} -out ${CSR_PATH} -subj /C=US/ST=California/CN=${host}`.split(' '));
        Bun.spawnSync(`openssl x509 -req -days 365 -in ${CSR_PATH} -signkey ${KEY_PATH} -out ${CERT_PATH}`.split(' '));
    
        unlinkSync(CSR_PATH);
    }

    return {
        cert: certFile,
        key: keyFile,
    }
}
