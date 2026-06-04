const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    casualLeave: {
      type: Number,
      default: 12,
    },
    sickLeave: {
      type: Number,
      default: 10,
    },
    privilegeLeave: {
      type: Number,
      default: 15,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LeaveBalance",
  leaveBalanceSchema
);