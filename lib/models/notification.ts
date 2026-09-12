import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    channels: [{ type: String, enum: ["sms", "email", "in-app"] }],
    status: { type: String, enum: ["sent", "failed", "pending"], default: "pending" },
    businessUnitId: { type: String, required: true },
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

export const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<mongoose.Document> | undefined) ??
  mongoose.model("Notification", schema)
