/**
 * 用户管理模块
 */
const router = require("koa-router")();
const utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const User = require("./../models/userSchema");
const Role = require("./../models/roleSchema");
const Conuter = require("./../models/counterSchema");
const Menu = require("./../models/menuSchema");
const md5 = require("md5");

router.prefix("/users"); //二级路由声明，前缀提出

router.post("/login", async (ctx) => {
  try {
    //查库
    const { userName, userPwd } = ctx.request.body;
    const res = await User.findOne({
      userName,
      userPwd,
    });

    if (res) {
      const data = res._doc;
      //生成token
      const token = jwt.sign(
        {
          data, //payload
        },
        "imooc", //密钥
        { expiresIn: 1000 } //30秒过期
      );
      data.token = token;
      //给前面成功数据
      ctx.body = utils.success(data);
    } else {
      //给前面错误提示
      ctx.body = utils.fail("账号或者密码不正确");
    }
  } catch (error) {
    ctx.body = utils.fail(error.message);
  }
});
//用户列表
router.get("/list", async (ctx) => {
  const { userId, userName, state } = ctx.request.query;
  const { page, skipIdex } = utils.pager(ctx.request.query);
  let params = {};
  if (userId) params.userId = userId;
  if (userName) params.userName = userName;
  if (state && state !== "0") params.state = state;
  try {
    const query = User.find(params, { _id: 0, userPwd: 0 });
    const list = await query.skip(skipIdex).limit(page.pageSize);
    const total = await User.countDocuments(params);

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
//用户删除/批量删除
router.post("/delete", async (ctx) => {
  //待删除的用户ID数组
  const { userIds } = ctx.request.body;
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 });
  ctx.body = utils.success(res);
});
//用户编辑/新增
router.post("/operate", async (ctx) => {
  const {
    userId,
    userName,
    userEmail,
    mobile,
    job,
    state,
    roleList,
    deptId,
    action,
  } = ctx.request.body;
  if (action === "add") {
    if (!userName || !userEmail || !deptId) {
      ctx.body = utils.fail("参数不完整", utils.CODE.PARAM_ERROR);
      return;
    }
    const res = await User.findOne(
      { $or: [{ userName }, { userEmail }] },
      "_id userName  userEmail"
    );
    if (res) {
      ctx.body = utils.fail(
        `系统检测到有重复用户，信息如下：${res.userName}-${res.userEmail}`
      );
    } else {
      //找到计数器，查找到用户ID加一，并返回结果
      const doc = await Conuter.findOneAndUpdate(
        { _id: "userId" },
        { $inc: { sequence_value: 1 } }
      );
      try {
        const user = new User({
          userId: doc.sequence_value,
          userName,
          userPwd: md5("123456"),
          userEmail,
          role: 1,
          roleList,
          job,
          state,
          deptId,
          mobile,
        });
        user.save();
        ctx.body = utils.success({}, "用户创建成功");
      } catch (error) {
        ctx.body = utils.fail(error.stack, "用户创建失败");
      }
    }
  } else if (action === "edit") {
    if (!deptId) {
      ctx.body = utils.fail("部门不能为空", utils.CODE.PARAM_ERROR);
      return;
    }
    try {
      await User.findOneAndUpdate(
        { userId },
        { job, state, roleList, deptId, mobile }
      );
      ctx.body = utils.success({}, "更新成功");
    } catch (error) {
      ctx.body = utils.fail(error.stack, "更新失败");
    }
  }
});
//获取全量用户
router.get("/all/list", async (ctx) => {
  try {
    const list = await User.find({}, "userId userName userEmail");
    ctx.body = utils.success(list);
  } catch (error) {
    ctx.ctx = utils.fail(error.stack);
  }
});
//根绝用户获取对应菜单
router.get("/getPerssionList", async (ctx) => {
  let authorization = ctx.request.headers.authorization;
  let { data } = utils.decoded(authorization);
  let menuList = await getMenuList(data.role, data.roleList);
  let actionList = getActionList(JSON.parse(JSON.stringify(menuList)));
  ctx.body = utils.success({ menuList, actionList });
});

async function getMenuList(userRole, roleKeys) {
  let rootList = [];
  //管理员，需要获取全量权限
  if (userRole === 0) {
    rootList = (await Menu.find({})) || [];
  } else {
    //查找用户对应的角色有哪些
    let roleList = await Role.find({ _id: { $in: roleKeys } });
    let permissionList = [];
    roleList.map((role) => {
      let { checkedKeys, halfCheckedKeys } = role.permissionList;
      permissionList = permissionList.concat([
        ...checkedKeys,
        ...halfCheckedKeys,
      ]);
    });
    permissionList = [...new Set(permissionList)];
    rootList = await Menu.find({ _id: { $in: permissionList } });
  }
  return utils.getTreeMenu(rootList, null, []);
}
function getActionList(list) {
  let actionList = [];
  const deep = (arr) => {
    while (arr.length) {
      let item = arr.pop();
      if (item.action) {
        item.action.map((action) => {
          actionList.push(action.menuCode);
        });
      }
      if (item.children && !item.action) {
        deep(item.children);
      }
    }
  };
  deep(list);
  return actionList;
}

module.exports = router;

