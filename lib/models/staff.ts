import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "staff", "customer"], default: "staff" },
    businessUnitId: { type: String, required: true },
    active: { type: Boolean, default: true },
    transactionsHandled: { type: Number, default: 0 },
    salesProcessed: { type: Number, default: 0 },
    voidedTransactions: { type: Number, default: 0 },
    initials: { type: String, default: "" },
  },
  { versionKey: false }
)

schema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.passwordHash
    return ret
  },
})

export const StaffModel =
  (mongoose.models.Staff as mongoose.Model<mongoose.Document> | undefined) ??
  mongoose.model("Staff", schema)
