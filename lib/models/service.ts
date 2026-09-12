import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    key: { type: String, enum: ["wash-fold", "wash-iron", "dry-clean", "comforter"], required: true },
    unit: { type: String, enum: ["per-kilo", "per-load"], required: true },
    price: { type: Number, required: true },
    businessUnitId: { type: String, required: true },
  },
  { versionKey: false }
)

schema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    return ret
  },
})

export const ServiceModel =
  (mongoose.models.Service as mongoose.Model<mongoose.Document> | undefined) ??
  mongoose.model("Service", schema)
