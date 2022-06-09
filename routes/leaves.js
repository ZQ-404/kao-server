/**
 * 角色管理模块
 */
const router = require("koa-router")();
const utils = require("../utils/utils");
const Leave = require("../models/leaveSchema");
const Dept = require("../models/deptSchema");
const { info } = require("../utils/log4j");

router.prefix("/leave"); //二级路由声明，前缀提出

//查询申请列表
router.get("/list", async (ctx) => {
  const { applyState } = ctx.request.query;
  const { page, skipIndex } = utils.pager(ctx.request.query);
  let authorization = ctx.request.headers.authorization;
  let { data } = utils.decoded(authorization);
  try {
    let params = {
      "applyUser.userId": data.userId,
    };
    if (applyState) params.applyState = applyState;
    const query = Leave.find(params);
    const list = await query.skip(skipIndex).limit(page.pageSize);
    const total = await Leave.countDocuments(params);
    ctx.body = utils.success({
      page: {
        ...page,
        total,
      },
      list,
    });
  } catch (error) {
    ctx.body = utils.fail(`查询异常:${error.stack}`);
  }
});
router.post("/operate", async (ctx) => {
  const { _id, action, ...params } = ctx.request.body;
  let authorization = ctx.request.headers.authorization;
  let { data } = utils.decoded(authorization);
  if (action === "create") {
    let orderNo = "XJ";
    orderNo += utils.formateDate(new Date(), "yyyyMMdd");
    const total = await Leave.countDocuments();
    params.orderNo = orderNo + total;
    //获取用户上级部门负责人信息
    let id = data.deptId.pop();
    //负责人信息
    let dept = await Dept.findById(id);
    //获取人事部分和财务部门信息
    let userList = await Dept.find({
      deptName: { $in: ["人事部门", "财务部门"] },
    });
    let auditUsers = dept.userName;

    let curAuditUserName = dept.userName;
    let auditFlows = [
      {
        userId: dept.userId,
        userName: dept.userName,
        userEmail: dept.userEmail,
      },
    ];
    userList.map((item) => {
      auditFlows.push({
        userId: item.userId,
        userName: item.userName,
        userEmail: item.userEmail,
      });
      auditUsers += "," + item.userName;
    });
    params.auditUsers = auditUsers;
    params.curAuditUserName = curAuditUserName;
    params.auditFlows = auditFlows;
    params.auditLogs = [];
    params.applyUser = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
    };

    let res = await Leave.create(params);
    ctx.body = utils.success("", "创建成功");
  } else {
    let res = await Leave.findByIdAndUpdate(_id, { applyState: 5 });
    ctx.body = utils.success("", "操作成功");
  }
});
module.exports = router;

