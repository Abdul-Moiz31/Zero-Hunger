import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['donor', 'ngo', 'volunteer', 'admin'], required: true },
  organization_name: String,
  contact_number: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isApproved: { type: Boolean, default: false },

  // Necessary  Fields for volunteer
  ngoId: { type: Schema.Types.ObjectId, ref: 'User'},
},{
  timestamps:true
});


export default model('User', userSchema);
