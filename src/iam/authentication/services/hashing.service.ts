import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';

/** Abstração Argon2id — resistência a GPU/ASIC em bases de credenciais hospitalares. */
@Injectable()
export class HashingService {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  /**
   * Aceita hashes Argon2 atuais e bcrypt legado (migração); rehash após login bem-sucedido.
   */
  async verify(storedHash: string, plain: string): Promise<boolean> {
    if (storedHash.startsWith('$2')) {
      return bcrypt.compare(plain, storedHash);
    }
    return argon2.verify(storedHash, plain);
  }

  needsRehash(storedHash: string): boolean {
    return storedHash.startsWith('$2');
  }
}
