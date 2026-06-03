import { Schema, model, InferSchemaType } from 'mongoose';

export const FOOD_STATUSES = ['available', 'in_progress', 'assigned', 'completed'] as const;

const foodSchema = new Schema(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    quantity: Number,
    unit: String,
    expiry_time: Date,
    pickup_window_start: String,
    pickup_window_end: String,
    status: {
      type: String,
      enum: FOOD_STATUSES,
      default: 'available',
      index: true,
    },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    acceptance_time: Date,
    volunteerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    delivered_time: Date,
    pickup_location: String,
    temperature_requirements: String,
    contact_number: String,
    dietary_info: String,
    img: String,
    delivery_proof_img: String,
    ngo_confirmed: { type: Boolean, default: false },
    ngo_confirmed_at: Date,
    expiry_alert_sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Common query: available foods not yet claimed.
foodSchema.index({ status: 1, ngoId: 1 });

export type IFood = InferSchemaType<typeof foodSchema>;

export const Food = model('Food', foodSchema);
export default Food;
