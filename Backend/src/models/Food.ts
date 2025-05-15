  import { Schema, model } from 'mongoose';

  const foodSchema = new Schema({
    donorId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    quantity: Number,
    unit: String,
    expiry_time: Date,
    pickup_window_start: String,
    pickup_window_end: String,
    status: { type: String, enum: ['available', 'assigned', 'completed'], default: 'available' },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptance_time: Date,
    volunteerId: { type: Schema.Types.ObjectId, ref: 'User' },
    delivered_time: Date,
    pickup_location:  String, 
    temperature_requirements: String,
    dietary_info: String,
    img: String,
  });

  export default model('Food', foodSchema);
