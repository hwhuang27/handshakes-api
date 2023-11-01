import passport from 'passport';
import { IStrategyOptions, Strategy as LocalStrategy, VerifyFunction} from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const options: IStrategyOptions = {
    usernameField: 'email',
    passwordField: 'password',
};

const verify: VerifyFunction = async (email, password, done) => {
    try{
        const user = await User.findOne({ email: email});
        if(!user){
            return done(null, false, { message: `Incorrect email or password`});
        }
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return done(null, false, { message: `Incorrect email or password`});
        }
        return done(null, user);

    } catch(err) {
        return done(err, false, { message: `Authentication failed`});
    }
};

passport.use(new LocalStrategy(options, verify));