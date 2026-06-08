const LeaveBalance = require("../models/LeaveBalance");
const Leave = require("../models/Leave");

const initializeLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.body;
    console.log(`initializeLeaveBalance: employeeId=${employeeId}`);

    const existing = await LeaveBalance.findOne({
      employeeId,
    });

    if (existing) {
      console.log(`initializeLeaveBalance failed: employeeId=${employeeId} already exists`);
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
    console.log(`initializeLeaveBalance success: employeeId=${employeeId}, balanceId=${leaveBalance._id}`);
  } catch (error) {
    console.error('initializeLeaveBalance error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getLeaveBalance = async (req, res) => {
  try {
    console.log(`getLeaveBalance: userId=${req.user && req.user.userId}`);
    const balance = await LeaveBalance.findOne({
      employeeId: req.user.userId,
    });

    if (!balance) {
      console.log(`getLeaveBalance failed: userId=${req.user && req.user.userId} balance not found`);
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    res.status(200).json(balance);
    console.log(`getLeaveBalance success: userId=${req.user && req.user.userId}`);
  } catch (error) {
    console.error('getLeaveBalance error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, numberOfDays } = req.body;
    console.log(`applyLeave: userId=${req.user && req.user.userId}, leaveType=${leaveType}, start=${startDate}, end=${endDate}, days=${numberOfDays}`);
    const leaveBalance = await LeaveBalance.findOne({
      employeeId: req.user.userId,
    });
    //validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(startDate) < today) {
      console.log(`applyLeave failed: userId=${req.user && req.user.userId} startDate ${startDate} is in the past`);
      return res.status(400).json({
        message: "Cannot apply leave for past dates",
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      console.log(`applyLeave failed: userId=${req.user && req.user.userId} startDate ${startDate} after endDate ${endDate}`);
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
      console.log(`applyLeave failed: userId=${req.user && req.user.userId} overlapping leave exists id=${existingLeave._id}`);
      return res.status(400).json({
        message: "Overlapping leave request exists",
      });
    }

    if (leaveType === "CASUAL" && leaveBalance.casualLeave < numberOfDays) {
      console.log(`applyLeave failed: userId=${req.user && req.user.userId} insufficient casual leave: have=${leaveBalance.casualLeave} need=${numberOfDays}`);
      return res.status(400).json({
        message: "Insufficient casual leave balance",
      });
    }

    if (leaveType === "SICK" && leaveBalance.sickLeave < numberOfDays) {
      console.log(`applyLeave failed: userId=${req.user && req.user.userId} insufficient sick leave: have=${leaveBalance.sickLeave} need=${numberOfDays}`);
      return res.status(400).json({
        message: "Insufficient sick leave balance",
      });
    }

    if (
      leaveType === "PRIVILEGE" &&
      leaveBalance.privilegeLeave < numberOfDays
    ) {
      console.log(`applyLeave failed: userId=${req.user && req.user.userId} insufficient privilege leave: have=${leaveBalance.privilegeLeave} need=${numberOfDays}`);
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
    console.log(`applyLeave success: userId=${req.user && req.user.userId} leaveId=${leave._id}`);
  } catch (error) {
    console.error('applyLeave error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPendingLeaves = async (req, res) => {
  try {
    console.log(`getPendingLeaves: userId=${req.user && req.user.userId}, role=${req.user && req.user.role}`);
    if (req.user.role !== "MANAGER") {
      console.log(`getPendingLeaves failed: userId=${req.user && req.user.userId} role=${req.user && req.user.role} not manager`);
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const leaves = await Leave.find({
      managerId: req.user.userId,
      status: "PENDING",
    });

    res.status(200).json(leaves);
    console.log(`getPendingLeaves success: managerId=${req.user && req.user.userId} returned=${leaves.length}`);
  } catch (error) {
    console.error('getPendingLeaves error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const approveLeave = async (req, res) => {
  try {
    console.log(`approveLeave: userId=${req.user && req.user.userId}, role=${req.user && req.user.role}, leaveId=${req.params.id}`);
    if (req.user.role !== "MANAGER") {
      console.log(`approveLeave failed: userId=${req.user && req.user.userId} role=${req.user && req.user.role} not manager`);
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      console.log(`approveLeave failed: leaveId=${req.params.id} not found`);
      return res.status(404).json({
        message: "Leave request not found",
    });
    }

    const leaveBalance = await LeaveBalance.findOne({
      employeeId: leave.employeeId,
    });

    if (!leaveBalance) {
      console.log(`approveLeave failed: leaveId=${leave._id} leaveBalance not found for employeeId=${leave.employeeId}`);
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    if (leave.leaveType === "CASUAL") {
      leaveBalance.casualLeave -= leave.numberOfDays;
    }

    if (leave.leaveType === "SICK") {
      leaveBalance.sickLeave -= leave.numberOfDays;
    }

    if (leave.leaveType === "PRIVILEGE") {
      leaveBalance.privilegeLeave -= leave.numberOfDays;
    }

    await leaveBalance.save();

    leave.status = "APPROVED";

    await leave.save();

    res.status(200).json({
      message: "Leave approved",
      leave,
    });
    console.log(`approveLeave success: managerId=${req.user && req.user.userId} leaveId=${leave._id}`);
  } catch (error) {
    console.error('approveLeave error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const rejectLeave = async (req, res) => {
  try {
    console.log(`rejectLeave: userId=${req.user && req.user.userId}, role=${req.user && req.user.role}, leaveId=${req.params.id}`);
    if (req.user.role !== "MANAGER") {
      console.log(`rejectLeave failed: userId=${req.user && req.user.userId} role=${req.user && req.user.role} not manager`);
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      console.log(`rejectLeave failed: leaveId=${req.params.id} not found`);
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    leave.status = "REJECTED";
    leave.rejectionReason = rejectionReason;

    await leave.save();

    console.log(
      `Notification: Leave rejected for employee ${leave.employeeId}`,
    );

    console.log(`rejectLeave success: managerId=${req.user && req.user.userId} leaveId=${leave._id}`);

    res.status(200).json({
      message: "Leave rejected",
      leave,
    });
  } catch (error) {
    console.error('rejectLeave error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getLeaveHistory = async (req, res) => {
  try {
    console.log(`getLeaveHistory: userId=${req.user && req.user.userId}, query=${JSON.stringify(req.query)}`);
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
    console.log(`getLeaveHistory success: userId=${req.user && req.user.userId} returned=${leaves.length}`);
  } catch (error) {
    console.error('getLeaveHistory error:', error);
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
  getLeaveHistory,
};
