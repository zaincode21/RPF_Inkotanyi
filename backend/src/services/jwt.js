import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    config.jwtSecret,
    {
      subject: user.email,
      expiresIn: config.jwtExpiration,
      algorithm: 'HS256',
    }
  );
}

export function parseToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
}

export function getUserIdFromToken(token) {
  const claims = parseToken(token);
  return claims.id;
}

export function getRoleFromToken(token) {
  const claims = parseToken(token);
  return claims.role;
}

export function extractBearerToken(authHeader) {
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return authHeader;
}
