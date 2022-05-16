/**
 * 角色
 */
const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
  _id: String,
  sequence_value: Number,
});

module.exports = mongoose.model("roles", roleSchema, "roles");
