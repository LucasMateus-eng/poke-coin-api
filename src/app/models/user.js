const mongoose = require('mongoose');
const TransactionSchema = require('./transaction');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    cpf: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    statement: { type: Array, default: [] },
    operations: { type: [TransactionSchema], default: [] },
    wallet: { type: [TransactionSchema], default: [] },
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', UserSchema);

