import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    contact: { type: String, default: "" },
    address: { type: String, default: "" },
    shareCustomerDb: { type: Boolean, default: false },
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

export const BusinessUnitModel =
  (mongoose.models.BusinessUnit as mongoose.Model<mongoose.Document> | undefined) ??
  mongoose.model("BusinessUnit", schema)
