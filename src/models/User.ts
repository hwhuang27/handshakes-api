
import { Document, Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface IUser extends Document{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    avatar: "snail" | "octopus" | "wolf" | "cat" | 
        "fish" | "panda" | "whale" | "prawn" | "bee" |
        "hellokitty" | "chicken" | "elephant" |
        "teddybear" | "dolphin";
    tokens: string[];
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        maxLength: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        maxLength: 100,
    },
    first_name: {
        type: String,
        maxLength: 50,
        required: true,
    },
    last_name: {
        type: String,
        maxLength: 50,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
        enum: ["snail", "octopus", "wolf", "cat",
            "fish", "panda", "whale", "prawn", "bee",
            "hellokitty", "chicken", "elephant",
            "teddybear", "dolphin"],
        default: "panda",
    },
    tokens: {
        type: [String],
        default: [],
    }
});

userSchema.virtual("url").get(function () {
    return `user/${this._id}`;
});

// 3. Create a Model.
const User = model<IUser>('User', userSchema);

export default User;