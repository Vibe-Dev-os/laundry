import mongoose from "mongoose"

const lineItemSchema = new mongoose.Schema(
  {
    serviceKey: String,
    name: String,
    unitPrice: Number,
    qty: Number,
    lineTotal: Number,
  },
  { _id: false }
)

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    customerName: { type: String, required: true },
    reservationId: { type: String },
    items: [lineItemSchema],
    subtotal: Number,
    discount: Number,
    tax: Number,
    total: Number,
    paymentMethod: { type: String, enum: ["cash", "gcash", "card"] },
    amountTendered: Number,
    change: Number,
    cashier: String,
    businessUnitId: { type: String, required: true },
    status: { type: String, enum: ["completed", "voided"], default: "completed" },
    voidReason: String,
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

export const SaleModel =
  (mongoose.models.Sale as mongoose.Model<mongoose.Document> | undefined) ??
  mongoose.model("Sale", schema)
