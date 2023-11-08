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
import { Server, Socket } from 'socket.io';
import './auth/localStrategy';
import './auth/jwtStrategy';
import { ACCESS_TOKEN_KEY } from './auth/jwtConfig';

import Message from './models/Message';
import Room from './models/Room';
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
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://messenger-client-liard.vercel.app'],
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

// Routes
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Log error to console
    console.log(`Error: ${err.message}`);
    console.error(err.stack);

    // Send error response
    res.status(err.status || 400).json({
        success: false,
        error: err.message || `Something went wrong`,
    });
});

// Socket IO
io.use((socket: Socket, next) => {
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
.on('connection', (socket: Socket) => {
    const myId = socket.data._id as string;
    // console.log(`User ${first_name} ${last_name} connected.`);

    socket.on('join room', async (roomId: string) => {
        if(socket.rooms.size > 1){
            // change socket.rooms from Set to Array and grab 2nd element (current user)
            const prevRoomId = [...socket.rooms][1];
            await socket.leave(prevRoomId);
        }
        await socket.join(roomId);
    });

    socket.on('private message', async (text: string, roomId: string) => {
        const message = new Message({
            fromUser: new Types.ObjectId(myId),
            message: text,
        });
        await message.save();

        await Room.updateOne(
            { _id: roomId}, 
            { $push: { messages: message }},
        );

        const first_name: string = socket.data.first_name;
        const last_name: string = socket.data.last_name;
        // send event to frontend to display real-time message
        socket.to(roomId).emit('display message', {
            message: text,
            fromId: myId,
            fromName: `${first_name} ${last_name}`
        });
    }); 
}); 

// Start server
httpServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

export default app;