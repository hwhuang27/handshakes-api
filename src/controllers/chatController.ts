import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

import { Types } from 'mongoose';
import Room from '../models/Room';
import { jwtDecoded } from '../auth/jwtConfig';

export const fetch_chat = [
    asyncHandler(async (req, res, _next) => {
        const user = req.user as jwtDecoded;
        const myId = new Types.ObjectId(user._id);
        const userId = new Types.ObjectId(req.params.userId);

        const room = await Room
            .findOne({ users: { $all: [myId, userId]} })
            .populate({
                path: 'users',
                select: ["first_name", "last_name", "avatar"],
            })
            .populate({
                path: 'messages',
                select: ["fromUser", "message", "timestamp"],
            });
        
        if(!room){
            // make new room if no room exists
            const newRoom = new Room({
                users: [myId, userId],
                messages: [],
            });
            await newRoom.save();

            res.status(200).json({
                success: true,
                message: `created new chat with user id: ${req.params.userId}`,
                room: newRoom,
            });
        } else{
            // return room object if room exists
            res.status(200).json({
                success: true,
                message: `fetched chat with user id: ${req.params.userId}`,
                room: room,
            });
        }
    })
];