import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { User } from '../../types';
import type { JwtConfig } from '../config/jwtConfig';
import { expiresInToSeconds } from '../config/jwtConfig';

export interface V1JwtPayload extends jwt.JwtPayload {
  sub: string;
  role: string;
}

export class V1JwtTokenService {
  constructor(private readonly config: JwtConfig) {}

  signAccessToken(user: User): { token: string; expiresInSeconds: number } {
    const expiresInSeconds = expiresInToSeconds(this.config.expiresIn);
    const signOptions = {
      expiresIn: this.config.expiresIn,
      issuer: 'excelsior-api-v1'
    } as SignOptions;
    const token = jwt.sign({ sub: user.id, role: user.role }, this.config.secret as Secret, signOptions);
    return { token, expiresInSeconds };
  }

  verifyAccessToken(token: string): V1JwtPayload {
    const decoded = jwt.verify(token, this.config.secret as Secret, { issuer: 'excelsior-api-v1' });
    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
      throw new Error('Invalid token payload');
    }
    const p = decoded as V1JwtPayload;
    if (!p.sub || !p.role) {
      throw new Error('Invalid token claims');
    }
    return p;
  }
}
