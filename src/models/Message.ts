
import { Types, Schema, model  } from 'mongoose';
import { DateTime } from 'luxon'; 

// 1. Create an interface representing a document in MongoDB.
interface IMessage{
    user: Types.ObjectId;
    text: string;
    timestamp: Date;
}

// 2. Create a Schema corresponding to the document interface.
const messageSchema = new Schema<IMessage>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxLength: 500,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});


messageSchema.virtual("timestamp_formatted").get(function () {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_MED);
});

// 3. Create a Model.
const Message = model<IMessage>('Message', messageSchema);

export default Message;