import mongoose from 'mongoose';

const lotSchema = new mongoose.Schema(
  {
    lotCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    yard: {
      type: Number,
      required: true,
      min: 1,
      max: 10000
    },
    meter: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Lot = mongoose.model('Lot', lotSchema);

export default Lot;
