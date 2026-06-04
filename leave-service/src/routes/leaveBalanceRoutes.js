const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../auth-service/src/middleware/authMiddleware");

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
router.post("/apply", authMiddleware, applyLeave);
router.get("/pending", authMiddleware, getPendingLeaves);
router.get("/history", authMiddleware, getLeaveHistory);
router.get("/", authMiddleware, getLeaveBalance);
router.put("/:id/approve", authMiddleware, approveLeave);
router.put("/:id/reject", authMiddleware, rejectLeave);

module.exports = router;
