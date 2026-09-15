import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWinner {
  rank: number;
  name: string;
  maskedPhone: string;
}

export interface IGiveaway extends Document {
  slugId: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailUrl: string;
  participantCount?: number;
  maxParticipants?: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate?: Date;
  endDate?: Date;
  timeZone?: string;
  prizeDescription?: string;
  approximateRetailValue?: string;
  eligibilityCriteria?: string;
  winners: IWinner[];
  createdAt: Date;
  updatedAt: Date;
}

const WinnerSchema = new Schema<IWinner>({
  rank: { type: Number, required: true, min: 1, max: 10 },
  name: { type: String, required: true },
  maskedPhone: { type: String, required: true },
}, { _id: false });

const GiveawaySchema = new Schema<IGiveaway>({
  slugId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  youtubeUrl: { type: String, required: true },
  youtubeVideoId: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  participantCount: { type: Number, default: 0, min: 0 },
  maxParticipants: { type: Number, min: 1 },
  status: {
    type: String,
    enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
    default: 'UPCOMING',
    index: true,
  },
  startDate: { type: Date },
  endDate: { type: Date },
  timeZone: { type: String, default: 'Asia/Colombo', trim: true },
  prizeDescription: { type: String, trim: true },
  approximateRetailValue: { type: String, trim: true },
  eligibilityCriteria: { type: String, trim: true },
  winners: [WinnerSchema],
}, {
  timestamps: true,
});

const Giveaway: Model<IGiveaway> =
  mongoose.models.Giveaway ||
  mongoose.model<IGiveaway>('Giveaway', GiveawaySchema);

export default Giveaway;
