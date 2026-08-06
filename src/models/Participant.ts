import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IParticipant extends Document {
  giveawayId: Types.ObjectId;
  fullName: string;
  phone: string;        // E.164 normalized, e.g. +94771234567
  youtubeUsername: string;
  createdAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  giveawayId: {
    type: Schema.Types.ObjectId,
    ref: 'Giveaway',
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  youtubeUsername: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// COMPOUND UNIQUE INDEXES — Core security constraint:
// A participant can enter the same giveaway only once per phone number
ParticipantSchema.index({ giveawayId: 1, phone: 1 }, { unique: true });
// A participant can enter the same giveaway only once per YouTube username
ParticipantSchema.index(
  { giveawayId: 1, youtubeUsername: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }, // case-insensitive username check
  }
);

const Participant: Model<IParticipant> =
  mongoose.models.Participant ||
  mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default Participant;
