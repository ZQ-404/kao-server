/**
 * 角色管理模块
 */
const router = require("koa-router")();
const utils = require("../utils/utils");
const Role = require("../models/roleSchema");
const { info } = require("../utils/log4j");

router.prefix("/roles"); //二级路由声明，前缀提出

//角色列表获取
router.get("/allList", async (ctx) => {
  try {
    const list = await Role.find({}, "_id roleName");
    ctx.body = utils.success(list);
  } catch (error) {
    ctx.body = utils.fail(`查询异常:${error.stack}`);
  }
});

// 按页获取角色列表
router.get("/list", async (ctx) => {
  const { roleName } = ctx.request.query;
  const { page, skipIndex } = utils.pager(ctx.request.query);

  try {
    let params = {};
    if (roleName) params.roleName = roleName;
    const query = Role.find(params);
    const list = await query.skip(skipIndex).limit(page.pageSize);
    const total = await Role.countDocuments(params);
    ctx.body = utils.success({
      list,
      page: {
        ...page,
        total,
      },
    });
  } catch (error) {
    utils.fail(`查询失败，${error.stack}`);
  }
});

// 角色创建、编辑、删除
router.post("/operate", async (ctx) => {
  const { _id, roleName, remark, action } = ctx.request.body;
  try {
    let params = { roleName, remark };
    let res = {};
    let info = "";
    if (action === "create") {
      let createTime = new Date();
      res = await Role.create({ ...params, createTime });
      info = "创建成功";
    } else if (action === "edit") {
      if (_id) {
        let updateTime = new Date();
        res = await Role.findByIdAndUpdate(_id, { ...params, updateTime });
        info = "编辑成功";
      } else {
        ctx.body = utils.fail("角色编号不能为空");
      }
    } else {
      if (_id) {
        res = await Role.findByIdAndRemove(_id);
        info = "删除成功";
      } else {
        ctx.body = utils.fail("角色编号不能为空");
      }
    }
    ctx.body = utils.success(res, info);
  } catch (error) {
    ctx.body = utils.fail(error.stack);
  }
});

// 权限设置
router.post("/update/permission", async (ctx) => {
  const { _id, permissionList } = ctx.request.body;
  try {
    let params = { updateTime: new Date(), permissionList };
    let res = await Role.findByIdAndUpdate(_id, params);
    ctx.body = utils.success(res, "权限设置成功");
  } catch (error) {
    ctx.body = utils.fail("权限设置失败");
  }
});

module.exports = router;

