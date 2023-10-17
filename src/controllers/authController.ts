import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_SECRET;

interface jwtUser {
    email: string,
    first_name: string,
    last_name: string,
    avatar: string,
}

function generateAccessToken(payload: jwtUser){
    return jwt.sign(payload, ACCESS_TOKEN_KEY!, { expiresIn: '30s'});
}

function generateRefreshToken(payload: jwtUser){
    return jwt.sign(payload, REFRESH_TOKEN_KEY!, { expiresIn: '7d'});
}
export const handle_refresh = [
    asyncHandler(async (req, res, next) => {
        const refreshToken = req.body.token;

    })
];

export const handle_login = [
    passport.authenticate('local', {
        failureRedirect: '/auth/loginFailure',
        session: false,
    }),
    
    asyncHandler(async (req, res, next) => {
        const user = req.user as IUser;

        const payload: jwtUser = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
        }

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.json({
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    }),
];

export const handle_register = [
    body("email")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Email must be specified.")
        .custom(async (value) => {
            const user = await User.findOne({email: value});
            if(user){
                throw new Error('Email is already in use');
            }
        }),
    body("password")
        .trim()
        .isLength({ min: 1 })
        .withMessage('Password must be specified.')
        .escape(),
    body('confirm_password')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Confirm password must be specified.')
        .custom((value, { req }) => {
        return value === req.body.password;
    }),    
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified."),
    body("last_name")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Last name must be specified."),

    asyncHandler(async (req, res, next) => {
            const errors = validationResult(req);

            if(!errors.isEmpty()){
                res.status(400).json({
                    message: `Error when registering`,
                    email: req.body.email,
                    errors: errors.array(),
                });
            } else {
                bcrypt.hash(req.body.password, 10, async(err, hash) => {
                    if (err) throw new Error(`Password failed to hash.`);
                    
                    const user = new User({
                        email: req.body.email,
                        password: hash,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                    })

                    let result = await user.save();

                    res.status(200).json({
                        message: `User created successfully.`,
                        user,
                    })
                });
            }
    }),
];



