import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const employeeSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  companyId: { type: String, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  jobDescription: { type: String, trim: true },
  dailyTasks: [{ type: String, trim: true }],
  functionCategories: [{ type: String, enum: ['Vendas', 'Liderança', 'Atendimento', 'Financeiro', 'Marketing', 'Operações', 'RH', 'TI', 'Produção', 'Administração', 'Ensino', 'Criativo'] }],
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

export default mongoose.model('Employee', employeeSchema)