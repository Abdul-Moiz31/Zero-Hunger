import { Schema, model, Document, Types } from 'mongoose';

interface DonationTemplate {
  title: string;
  description: string;
  quantity: number;
  unit: 'meals' | 'kg' | 'boxes';
  temperature_requirements?: string;
  dietary_info?: string;
  pickup_location: string;
  contact_number: string;
  pickup_duration_hours: number; // how long the pickup window should be
}

export interface ISchedule extends Document {
  donorId: Types.ObjectId;
  label: string;
  daysOfWeek: number[]; // 0=Sun … 6=Sat
  timeHHMM: string;     // "18:30"
  template: DonationTemplate;
  active: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<DonationTemplate>({
  title:                   { type: String, required: true },
  description:             { type: String, required: true },
  quantity:                { type: Number, required: true, min: 1 },
  unit:                    { type: String, enum: ['meals', 'kg', 'boxes'], required: true },
  temperature_requirements: String,
  dietary_info:            String,
  pickup_location:         { type: String, required: true },
  contact_number:          { type: String, required: true },
  pickup_duration_hours:   { type: Number, default: 2 },
}, { _id: false });

const scheduleSchema = new Schema<ISchedule>(
  {
    donorId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label:       { type: String, required: true },
    daysOfWeek:  { type: [Number], required: true },
    timeHHMM:    { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    template:    { type: TemplateSchema, required: true },
    active:      { type: Boolean, default: true },
    lastRunAt:   Date,
    nextRunAt:   Date,
  },
  { timestamps: true }
);

export default model<ISchedule>('Schedule', scheduleSchema);
