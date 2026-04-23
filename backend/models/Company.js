import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const companySchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  industry: { type: String, trim: true },
  teamSize: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

companySchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

companySchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('Company', companySchema)