import passport from 'passport';
import { Strategy as LocalStrategy, VerifyFunction} from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const verify: VerifyFunction = async (email, password, done) => {
    try{
        const user = await User.findOne({ email: email});
        if(!user){
            return done(null, false, { message: `Incorrect email or password`});
        };
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return done(null, false, { message: `Incorrect email or password`});
        }

        return done(null, user);

    } catch(err) {
        return done(err, false, { message: `Authentication failed`});
    }
}

const strategy = new LocalStrategy(
    { usernameField: 'email', passwordField: 'password'},
    verify,
);

passport.use(strategy);

// const secret = process.env.SECRET_KEY;

// const cookieExtractor = (req: Request) => {
//     let jwt = null;

//     if (req && req.cookies) {
//         jwt = req.cookies['jwt'];
//     };

//     return jwt;
// }

// passport.use('jwt',
//     new JWTStrategy({
//         jwtFromRequest: cookieExtractor,
//         secretOrKey: secret,
//     }, (jwtPayload, done) => {
//         const { expiration } = jwtPayload;

//         if (Date.now() > expiration) {
//             done('Unauthorized', false);
//         }

//         done(null, jwtPayload);
//     }))