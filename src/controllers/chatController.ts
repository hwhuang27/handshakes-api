import createError from 'http-errors';
import asyncHandler from 'express-async-handler';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

import { Types } from 'mongoose';
import User, { IUser } from '../models/User';
import Message, { IMessage } from '../models/Message';
import { jwtDecoded } from '../auth/jwtConfig';

import Room, { IRoom } from '../models/Room';

export const fetch_chat = [
    asyncHandler(async (req, res, next) => {
        const user = req.user as jwtDecoded;
        const userId = new Types.ObjectId(user._id);
        const receiverId = new Types.ObjectId(req.params.userId);

        const room = await Room
            .findOne({ users: [userId, receiverId]})
            .populate({
                path: 'users',
                select: ["first_name", "last_name", "avatar"],
            })
            .populate({
                path: 'messages',
            })

        if(!room){
            const newRoom = new Room({
                users: [userId, receiverId],
                messages: [],
            })
            await newRoom.save();
            res.status(200).json({
                success: true,
                message: `created new chat with user id: ${req.params.userId}`,
                newRoom
            })
        } else{
            res.status(200).json({
                success: true,
                message: `fetched chat with user id: ${req.params.userId}`,
                room
            })
        }
    })
];