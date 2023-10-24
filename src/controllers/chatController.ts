import createError from 'http-errors';
import asyncHandler from 'express-async-handler';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

import User, { IUser } from '../models/User';
import Message, { IMessage } from '../models/Message';

export const send_message = [
    asyncHandler(async (req, res, next) => {
        const message = new Message(req.body);

        res.status(200).json({
            success: true,
            message: `send a message`,
        });
    })
];

export const fetch_messages = [
    asyncHandler(async (req, res, next) => {


        res.status(200).json({
            success: true,
            message: `emit all messages`,
        });
    })
];