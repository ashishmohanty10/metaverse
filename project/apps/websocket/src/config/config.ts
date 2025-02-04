import { config as conf } from "dotenv";
conf();

const _config = {
  jwtPassword: process.env.JWT_PASSWORD,
  port: process.env.PORT || 3004,
};

export const config = Object.freeze(_config);
