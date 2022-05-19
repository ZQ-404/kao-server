/**
 * 角色模型
 */
const mongoose = require("mongoose");

const deptSchema = mongoose.Schema({
  deptName: String,
  userName: String,
  userEmail: String,
  userId: String,
  parentId: [mongoose.Types.ObjectId],
  createTime: {
    type: Date,
    default: Date.now(),
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("depts", deptSchema, "depts");
