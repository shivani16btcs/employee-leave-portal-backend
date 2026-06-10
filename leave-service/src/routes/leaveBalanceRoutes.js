const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  applyLeave,
  getLeaveBalance,
  initializeLeaveBalance,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getLeaveHistory
} = require("../controllers/leaveController");

router.post("/init", initializeLeaveBalance);
router.get("/pending", authMiddleware, getPendingLeaves);
router.get("/history", authMiddleware, getLeaveHistory);
router.post("/apply", authMiddleware, applyLeave);
router.put("/:id/approve", authMiddleware, approveLeave);
router.put("/:id/reject", authMiddleware, rejectLeave);
router.get("/", authMiddleware, getLeaveBalance);

module.exports = router;
