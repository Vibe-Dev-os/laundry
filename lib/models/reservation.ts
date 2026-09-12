import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    customerName: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, default: "" },
    serviceKey: { type: String, enum: ["wash-fold", "wash-iron", "dry-clean", "comforter"], required: true },
    kilos: { type: Number, required: true },
    scheduledAt: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "received", "washing", "drying", "ready", "claimed", "cancelled"],
      default: "pending",
    },
    businessUnitId: { type: String, required: true },
    notes: { type: String },
    createdAt: { type: String, required: true },
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

export const ReservationModel =
  (mongoose.models.Reservation as mongoose.Model<mongoose.Document> | undefined) ??
  mongoose.model("Reservation", schema)
