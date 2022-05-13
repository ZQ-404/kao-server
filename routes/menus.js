const router = require("koa-router")();
const util = require("../utils/utils");
const Menu = require("../models/menuSchema");

router.prefix("/menu");

router.get("/list", async (ctx) => {
  const { menuName, menuState } = ctx.request.query;
  let params = {};
  if (menuName) params.menuName = menuName;
  if (menuState) params.menuState = menuState;
  let rootList = [];
  rootList = await Menu.find(params);
  getTreeMenu(rootList, null, []);
  const permissionList = getTreeMenu(rootList, null, []);
  ctx.body = util.success(permissionList);
});
//递归拼接树形列表
function getTreeMenu(rootList, id, list) {
  for (let i = 0; i < rootList.length; i++) {
    let item = rootList[i];
    if (String(item.parentId.slice().pop()) === String(id)) {
      list.push(item._doc);
    }
  }
  list.map((item) => {
    item.children = [];
    getTreeMenu(rootList, item._id, item.children);
    if (item.children.length === 0) {
      delete item.children;
    } else if (item.children[0].menuType === 2 && item.children.length > 0) {
      //区别按钮和菜单
      item.action = item.children;
    }
  });
  return list;
}

router.post("/operate", async (ctx) => {
  const { _id, action, ...params } = ctx.request.body;
  let res, info;
  try {
    if (action === "add") {
      res = await Menu.create(params);
      info = "创建成功";
    } else if (action === "edit") {
      params.updateTime = new Date();
      res = await Menu.findByIdAndUpdate(_id, params);
      info = "编辑成功";
    } else {
      res = await Menu.findByIdAndRemove(_id);
      await Menu.deleteMany({ parentId: { $all: [_id] } });
      info = "删除成功";
    }
    ctx.body = util.success("", info);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});

module.exports = router;
