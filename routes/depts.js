/**
 * 部门管理模块
 */
const router = require("koa-router")();
const utils = require("../utils/utils");
const Dept = require("../models/deptSchema");
const { info } = require("../utils/log4j");

router.prefix("/dept"); //二级路由声明，前缀提出

//部门列表
router.get("/list", async (ctx) => {
  try {
    let { deptName } = ctx.request.query;
    let params = {};
    if (deptName) params.deptName = deptName;
    let deptList = await Dept.find(params);
    if (deptName) {
      ctx.body = utils.success(deptList);
    } else {
      let treeList = getTreeDept(deptList, null, []);
      ctx.body = utils.success(treeList);
    }
  } catch (error) {
    ctx.body = utils.fail(`查询异常:${error.stack}`);
  }
});
//递归拼接树形列表
function getTreeDept(rootList, id, list) {
  for (let i = 0; i < rootList.length; i++) {
    let item = rootList[i];
    if (String(item.parentId.slice().pop()) === String(id)) {
      list.push(item._doc);
    }
  }
  list.map((item) => {
    item.children = [];
    getTreeDept(rootList, item._id, item.children);
    if (item.children.length === 0) {
      delete item.children;
    }
  });
  return list;
}
//部门创建、删除
router.post("/operate", async (ctx) => {
  const { _id, action, ...params } = ctx.request.body;
  let res, info;
  try {
    if (action === "create") {
      res = await Dept.create(params);
      info = "创建成功";
    } else if (action === "edit") {
      params.updateTime = new Date();
      res = await Dept.findByIdAndUpdate(_id, params);
      info = "编辑成功";
    } else if (action === "delete") {
      res = await Dept.findByIdAndDelete(_id);
      await Dept.deleteMany({ parentId: { $all: [_id] } });
      info = "删除成功";
    }
    ctx.body = utils.success(res, info);
  } catch (error) {
    ctx.body = utils.fail(error.stack);
  }
});

module.exports = router;
