import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalText: string;
  fileSize: number;
  uploadedAt: Date;
  analysisCount: number;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    originalText: { type: String, required: true },
    fileSize: { type: Number, required: true },
    analysisCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IResume>('Resume', resumeSchema);
