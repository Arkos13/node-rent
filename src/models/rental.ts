import {Document, model, Model, Schema} from 'mongoose';

const rentalSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        max: [128, 'Too long, max is 128 characters']
    },
    city: {
        type: String,
        required: true,
        lowercase: true
    },
    street: {
        type: String,
        required: true,
        min: [4, 'Too short, min is 4 characters']
    },
    category: {
        type: String,
        required: true,
        lowercase: true
    },
    image: {
        type: String,
        required: true },
    bedrooms: Number,
    shared: Boolean,
    description: {
        type: String,
        required: true
    },
    dailyRate: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

interface IRental extends Document {
    title: string,
    city: string,
    street: string,
    category: string,
    image: string,
    bedrooms: number,
    shared: boolean,
    description: string,
    dailyRate: number,
    createdAt: Date
}

const RentalModel: Model<IRental> = model<IRental>('Rental', rentalSchema);

export {RentalModel}