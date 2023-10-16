import { Types, Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface IChatroom {
    users: Types.ObjectId[];
    messages: Types.ObjectId[];
}

// 2. Create a Schema corresponding to the document interface.
const chatroomSchema = new Schema<IChatroom>({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
});

// 3. Create a Model.
const Chatroom = model<IChatroom>('Chatroom', chatroomSchema);

export default Chatroom;