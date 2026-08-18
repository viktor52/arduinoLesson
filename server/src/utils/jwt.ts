import jwt from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
  userId: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function getTokenExpiry(): Date {
  const expiresIn = config.jwt.expiresIn;
  const now = new Date();

  if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn, 10);
    now.setDate(now.getDate() + days);
  } else if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn, 10);
    now.setHours(now.getHours() + hours);
  } else {
    now.setDate(now.getDate() + 7);
  }

  return now;
}
