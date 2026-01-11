import { config } from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';

config();

import AuthRouter from './modules/auth/auth.routes';

const app = express();

app.use(cookieParser());

app.use('/auth', AuthRouter);

// app.use(loggingMiddleware);

app.listen(process.env.PORT, () => {
  console.info(`App started at port ${process.env.PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
