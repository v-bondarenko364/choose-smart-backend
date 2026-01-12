import { config } from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

config();

import AuthRouter from './modules/auth/auth.routes';
import DecisionRouter from './modules/decision/decision.routes';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://choosesm.art'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', AuthRouter);
app.use('/decisions', DecisionRouter);

app.listen(process.env.PORT, () => {
  console.info(`App started at port ${process.env.PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
