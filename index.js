import bootstrap from './src/app.controller.js';
import express from 'express';
import dotenv from 'dotenv';
import {PORT} from './config/config.service.js';

const app = express();

await bootstrap(app,express);

app.listen(PORT, () => {
  console.log(`Server is running http://127.0.0.1:${PORT}`);
});