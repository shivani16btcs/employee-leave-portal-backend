const LeaveBalance = require("../models/LeaveBalance");
const Leave = require("../models/Leave");

const initializeLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const existing = await LeaveBalance.findOne({
      employeeId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Leave balance already exists",
      });
    }

    const leaveBalance = await LeaveBalance.create({
      employeeId,
      casualLeave: 12,
      sickLeave: 10,
      privilegeLeave: 15,
    });

    res.status(201).json(leaveBalance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getLeaveBalance = async (req, res) => {
  try {
    const balance = await LeaveBalance.findOne({
      employeeId: req.user.userId,
    });

    if (!balance) {
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    res.status(200).json(balance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, numberOfDays } = req.body;
    const leaveBalance = await LeaveBalance.findOne({
      employeeId: req.user.userId,
    });
    //validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(startDate) < today) {
      return res.status(400).json({
        message: "Cannot apply leave for past dates",
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }

    const existingLeave = await Leave.findOne({
      employeeId: req.user.userId,
      status: { $in: ["PENDING", "APPROVED"] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (existingLeave) {
      return res.status(400).json({
        message: "Overlapping leave request exists",
      });
    }

    if (leaveType === "CASUAL" && leaveBalance.casualLeave < numberOfDays) {
      return res.status(400).json({
        message: "Insufficient casual leave balance",
      });
    }

    if (leaveType === "SICK" && leaveBalance.sickLeave < numberOfDays) {
      return res.status(400).json({
        message: "Insufficient sick leave balance",
      });
    }

    if (
      leaveType === "PRIVILEGE" &&
      leaveBalance.privilegeLeave < numberOfDays
    ) {
      return res.status(400).json({
        message: "Insufficient privilege leave balance",
      });
    }

    const leave = await Leave.create({
      employeeId: req.user.userId,
      ...req.body,
      status: "PENDING",
    });

    console.log(`Notification: Leave applied by ${req.user.userId}`);

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPendingLeaves = async (req, res) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const leaves = await Leave.find({
      managerId: req.user.userId,
      status: "PENDING",
    });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const approveLeave = async (req, res) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leaveBalance) {
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    leave.status = "APPROVED";

    await leave.save();

    res.status(200).json({
      message: "Leave approved",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const rejectLeave = async (req, res) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    leave.status = "REJECTED";
    leave.rejectionReason = rejectionReason;

    await leave.save();

    console.log(
      `Notification: Leave rejected for employee ${leave.employeeId}`
    );

    res.status(200).json({
      message: "Leave rejected",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const getLeaveHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      employeeId: req.user.userId,
    };

    if (status) {
      query.status = status.toUpperCase();
    }

    const leaves = await Leave.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  initializeLeaveBalance,
  getLeaveBalance,
  applyLeave,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getLeaveHistory
};
