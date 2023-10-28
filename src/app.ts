import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './auth/localStrategy';
import './auth/jwtStrategy';
import { ACCESS_TOKEN_KEY, jwtDecoded } from './auth/jwtConfig';

import User, { IUser } from './models/User';
import Message, { IMessage } from './models/Message';
import Room, { IRoom } from './models/Room';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = process.env.PORT || 3000;

import authRouter from './routes/auth';
import apiRouter from './routes/api';

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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(passport.initialize());

app.use('/auth', authRouter);
app.use('/api', apiRouter);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Log error to console
    console.log(`Error: ${err.message}`);
    console.error(err.stack);

    // Send error response
    res.status(err.status || 400).json({
        success: false,
        error: err.message || `Something went wrong`,
    })
});

// Socket IO
io.use((socket, next) => {
    // jwt authorization middleware
    if(socket.handshake.query && socket.handshake.query.token){
        const accessToken = socket.handshake.query.token as string;
        jwt.verify(accessToken, ACCESS_TOKEN_KEY!, (err, decoded) => {
            if(err) return next(new Error('Authentication error'));
            socket.data = decoded;
            next();
        });
    }
    else {
        next(new Error('Authentication error'));
    }
})
.on('connection', (socket) => {
    const data = socket.data;
    const userId = socket.data._id;

    socket.on('chat message', async (msg) => {
        const message = new Message({
            user: new Types.ObjectId(userId),
            message: msg,
        });
        await message.save();

        io.emit('chat message', msg);
    });
}); 

httpServer.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;