import { Schema, model } from "mongoose";
import { IUser } from './User';

export interface IFood extends Document {
  title: string;
  description?: string; // Optional description of the food item
  donorId: Schema.Types.ObjectId | IUser; // Populated donor
  ngoId?: Schema.Types.ObjectId | IUser; // Populated NGO (optional)
  volunteerId?: Schema.Types.ObjectId | IUser; // Populated volunteer (optional)
  status: 'available' | 'in_progress' | 'assigned' | 'completed';
  acceptance_time?: Date; // When the food was claimed
  createdAt: Date; // Timestamp for creation
  updatedAt: Date; // Timestamp for updates
  foodLocation?: string; // Optional location of the food donation (renamed to avoid conflict with Document.location)
  quantity?: number; // Optional quantity (e.g., number of meals)
  expiryDate?: Date; // Optional expiry date for perishable food
}

const foodSchema = new Schema({
  donorId: { type: Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  quantity: Number,
  unit: String,
  expiry_time: Date,
  pickup_window_start: String,
  pickup_window_end: String,
  status: {
    type: String,
    enum: ["available", "in_progress", "assigned", "completed"],
    default: "available",
  },
  ngoId: { type: Schema.Types.ObjectId, ref: "User" },
  acceptance_time: Date,
  volunteerId: { type: Schema.Types.ObjectId, ref: "User" },
  delivered_time: Date,
  pickup_location: String,
  temperature_requirements: String,
  contact_number: String,
  dietary_info: String,
  createdAt: { type: Date, default: Date.now },
  img: String,
});

export const Food = model<IFood>('Food', foodSchema);
export default Food;
