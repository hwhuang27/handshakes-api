import createError from 'http-errors';
import asyncHandler from 'express-async-handler';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

import User, { IUser } from '../models/User';

export const chatroom = [
    asyncHandler(async (req, res, next) => {

        res.status(200).json({
            success: true,
            message: `placeholder`,
        });
    })
];