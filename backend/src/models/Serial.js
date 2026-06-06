import mongoose from 'mongoose';

const serialSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: true,
      index: true
    },
    lotCode: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    yard: {
      type: Number,
      required: true
    },
    meter: {
      type: Number,
      required: true
    },
    rollNumber: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['Generated', 'Assigned'],
      default: 'Generated',
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

serialSchema.index({ lotCode: 1, serialNumber: 1 });
serialSchema.index({ date: 1, lotCode: 1 });

const Serial = mongoose.model('Serial', serialSchema);

export default Serial;
