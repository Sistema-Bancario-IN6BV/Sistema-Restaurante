process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import dotenv from 'dotenv';
import { initServer } from './configs/app.js';

dotenv.config();

initServer();