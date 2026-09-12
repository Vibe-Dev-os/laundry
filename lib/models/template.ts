import mongoose from "mongoose"

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
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

export const TemplateModel =
  (mongoose.models.Template as mongoose.Model<mongoose.Document> | undefined) ??
  mongoose.model("Template", schema)
