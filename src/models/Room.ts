import { Types, Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IRoom {
    _id: Types.ObjectId;
    users: Types.ObjectId[];
    messages: Types.ObjectId[];
}

// 2. Create a Schema corresponding to the document interface.
const roomSchema = new Schema<IRoom>({
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
const Room = model<IRoom>('Room', roomSchema);

export default Room;