import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

import passport from './login.js';
import { router as registrationRouter } from './registration.js';
import { router as adminRoute } from './admin.js';

dotenv.config();

const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString || !sessionSecret) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();

// TODO klára uppsetningu á appi
