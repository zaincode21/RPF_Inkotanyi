import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 8090,
  jwtSecret: process.env.JWT_SECRET || 'mySecretKeyThatIsAtLeast256BitsLongForHS256AlgorithmToWork',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim()),
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    fromName: process.env.MAIL_FROM_NAME || 'FPR Inkotanyi Portal',
  },
};
