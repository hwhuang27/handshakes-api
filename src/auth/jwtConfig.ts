import { CookieOptions } from 'express';

export interface jwtEncoded {
    _id?: string,
    email: string,
    first_name: string,
    last_name: string,
    avatar: string,
}

export interface jwtDecoded {
    _id: string,
    email: string,
    first_name: string,
    last_name: string,
    avatar: string,
    iat: number,
    exp: number,
}

export const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7,
}
