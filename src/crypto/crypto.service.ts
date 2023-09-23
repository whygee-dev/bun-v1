import { Service } from "typedi";

@Service()
export class CryptoService {
  hashPassword(password: string) {
    return Bun.password.hash(password, { algorithm: "argon2id" });
  }

  verifyPassword(password: string, hash: string) {
    return Bun.password.verify(password, hash);
  }
}
