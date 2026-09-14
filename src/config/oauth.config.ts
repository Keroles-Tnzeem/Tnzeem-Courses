import { registerAs } from '@nestjs/config';

export default registerAs('oauth', () => ({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
  },
}));
