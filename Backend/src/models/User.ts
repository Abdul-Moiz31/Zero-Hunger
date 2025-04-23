import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['donor', 'ngo', 'volunteer', 'admin'], required: true },
  organization_name: String,
  contact_number: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

export default model('User', userSchema);
