import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const invitationSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  companyId: { type: String, ref: 'Company', required: true, index: true },
  token: { type: String, unique: true, index: true, default: () => uuidv4() },
  employeeName: { type: String, required: true, trim: true },
  employeeEmail: { type: String, trim: true, lowercase: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  usedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

export default mongoose.model('Invitation', invitationSchema)