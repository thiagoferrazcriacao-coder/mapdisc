import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const discResultSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  employeeId: { type: String, ref: 'Employee', required: true, index: true },
  companyId: { type: String, ref: 'Company', required: true, index: true },
  invitationId: { type: String, ref: 'Invitation' },
  responses: [{
    group: Number,
    most: String,
    least: String
  }],
  scores: {
    D: { type: Number, default: 0 },
    I: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    C: { type: Number, default: 0 }
  },
  percentages: {
    D: { type: Number, default: 0 },
    I: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    C: { type: Number, default: 0 }
  },
  dominantType: { type: String },
  secondaryType: { type: String },
  analysis: {
    currentFunctionFit: { type: Number },
    currentFunctionName: { type: String },
    recommendations: [{
      functionName: String,
      fitPercentage: Number,
      reason: String
    }],
    improvementTips: { type: String },
    strengthsInCurrentRole: { type: String },
    challengesInCurrentRole: { type: String }
  },
  completedAt: { type: Date, default: Date.now }
}, { _id: false })

export default mongoose.model('DISCResult', discResultSchema)