import { Schema, model, InferSchemaType } from 'mongoose';

const ratingSchema = new Schema(
  {
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// One rating per NGO per delivery
ratingSchema.index({ ngoId: 1, foodId: 1 }, { unique: true });

export type IRating = InferSchemaType<typeof ratingSchema>;

export const Rating = model('Rating', ratingSchema);
export default Rating;
