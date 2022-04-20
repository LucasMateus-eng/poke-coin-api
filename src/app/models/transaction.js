const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    base_experience: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    state: {
      type: String,
      enum: ['purchased', 'sold'],
      required: true
    }
  }
)

module.exports = TransactionSchema;