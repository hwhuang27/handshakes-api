import 'dotenv/config';

import express from 'express';
import path from 'path';
import passport from 'passport';
import logger from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { createServer } from 'http';
import './auth/passportLocal';

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT || 3000;

import authRouter from './routes/auth';
// import apiRouter from './routes/api';

// Database
import mongoose from 'mongoose';
mongoose.set("strictQuery", false);
const mongoDB = process.env.DB_CONNECTION_URL;
main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB!);
    console.log(`Connected to MongoDB`);
}

// Middleware
const corsOptions = {
    // add for frontend after: e.g. ('https://bookshelf-client-eight.vercel.app')
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    optionsSuccessStatus: 200
};

app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));
app.options('*', cors(corsOptions));

app.use('/auth', cors(corsOptions), authRouter);
// app.use('/api', cors(corsOptions), apiRouter);

httpServer.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;