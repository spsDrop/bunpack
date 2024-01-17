import { generateKeyPair } from "crypto";

export function createKeys() {
  return new Promise<{cert: string, key: string}>((res, rej) => {
    generateKeyPair(
      "rsa",
      {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          cipher: "aes-256-cbc",
          passphrase: "top secret",
        },
      },
      (err, cert, key) => {
        if (err) {
          rej(err);
        } else {
          res({ cert, key });
        }
        // Handle errors and use the generated key pair.
      }
    );
  });
}
