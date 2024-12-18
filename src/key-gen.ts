import { mkdirSync, unlinkSync } from "fs";
import path from "path";

const KEY_DIR = '.cache'
const KEY_PATH = path.join(KEY_DIR, 'key.pem');
const CSR_PATH = path.join(KEY_DIR, 'csr.pem');
const CERT_PATH = path.join(KEY_DIR, 'cert.pem');

export async function createKeys(host = 'localhost', additionalHosts = [ 'localhost.adobe.com' ]) {
    const keyFile = Bun.file(KEY_PATH);
    const certFile = Bun.file(CERT_PATH);

    if (!(await keyFile.exists()) || !(await certFile.exists())) {
        try {
            mkdirSync(KEY_DIR);
        } catch (e) {
            console.warn('.cache dir already exists');
        }
        const altNames = additionalHosts.length === 0
            ? ''
            : `-extfile <(printf "subjectAltName=${additionalHosts.map(x => `DNS:${x}`).join(',')}")`;
        const script = `
openssl genrsa -out ${KEY_PATH};
openssl req -new -subj "/C=US/CN=${host}" -key "${KEY_PATH}" -out "${CSR_PATH}";
openssl x509 -req ${altNames} -days 365 -in ${CSR_PATH} -signkey ${KEY_PATH} -out ${CERT_PATH};
`;
        console.log('---\n Generating cert with the following script\n---');
        console.log('script', script);
        Bun.spawnSync(['bash', '-c', script]);
        console.log('---\n DONE\n---');
        unlinkSync(CSR_PATH);
    }

    return {
        cert: certFile,
        key: keyFile,
    }
}
