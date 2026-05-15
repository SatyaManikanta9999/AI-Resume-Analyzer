import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescription: string;
  jobTitle: string;
  overallScore: number;
  matchScore: number;
  skills: {
    matched: string[];
    missing: string[];
    extra: string[];
  };
  sections: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  atsCompatibility: {
    score: number;
    issues: string[];
  };
  keywordDensity: { keyword: string; count: number }[];
  summary: string;
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescription: { type: String, required: true },
    jobTitle: { type: String, required: true },
    overallScore: { type: Number, required: true },
    matchScore: { type: Number, required: true },
    skills: {
      matched: [String],
      missing: [String],
      extra: [String],
    },
    sections: {
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
    },
    atsCompatibility: {
      score: { type: Number },
      issues: [String],
    },
    keywordDensity: [
      {
        keyword: String,
        count: Number,
      },
    ],
    summary: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAnalysis>('Analysis', analysisSchema);
