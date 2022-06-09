/**
 * 角色模型
 */
const mongoose = require("mongoose");

const leaveSchema = mongoose.Schema({
  orderNo: String,
  applyType: String,
  startTime: {
    type: Date,
    default: Date.now(),
  },
  endTime: {
    type: Date,
    default: Date.now(),
  },
  leaveTime: String,
  reasons: String,
  auditUsers: String,
  curAuditUserName: String,
  auditFlows: [
    {
      userId: String,
      userName: String,
      userEmail: String,
    },
  ],
  auditLogs: [
    {
      userId: String,
      userName: String,
      createTime: Date,
      remark: String,
      action: String,
    },
  ],
  applyState: { type: Number, default: 1 },
  createTime: { type: Date, default: new Date() },
});

module.exports = mongoose.model("leaves", leaveSchema, "leaves");
