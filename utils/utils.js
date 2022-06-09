/**
 * 通用的工具函数
 */
const log4js = require("./log4j");
const jwt = require("jsonwebtoken");
const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 1001, //参数错误
  USER_ACCOUNT_ERROR: 2001, //账号或密码错误
  USER_LOGIN_ERROR: 3001, //用户未登录
  BUSIESS_ERROR: 4001, //业务请求失败
  AUTH_ERROR: 5001, //认证失败或者TOKEN过期
};

module.exports = {
  /**
   * 分页结构封装
   * @param {number} pageNum
   * @param {number} pageSize
   */
  pager({ pageNum = 1, pageSize = 10 }) {
    pageNum *= 1;
    pageSize *= 1;
    const skipIndex = (pageNum - 1) * pageSize; //计算第二页从什么索引开始
    return {
      page: {
        pageNum,
        pageSize,
      },
      skipIndex,
    };
  },
  success(data = "", msg = "", code = CODE.SUCCESS) {
    log4js.debug(data);
    return {
      data,
      msg,
      code,
    };
  },
  fail(msg = "", code = CODE.BUSIESS_ERROR, data = "") {
    log4js.debug(msg);
    return {
      code,
      data,
      msg,
    };
  },
  decoded(authorization) {
    if (authorization) {
      let token = authorization.split(" ")[1];
      return jwt.verify(token, "imooc");
    } else {
      return "";
    }
  },
  //递归拼接树形列表
  getTreeMenu(rootList, id, list) {
    for (let i = 0; i < rootList.length; i++) {
      let item = rootList[i];
      if (String(item.parentId.slice().pop()) === String(id)) {
        list.push(item._doc);
      }
    }
    list.map((item) => {
      item.children = [];
      this.getTreeMenu(rootList, item._id, item.children);
      if (item.children.length === 0) {
        delete item.children;
      } else if (item.children[0].menuType === 2 && item.children.length > 0) {
        //区别按钮和菜单
        item.action = item.children;
      }
    });
    return list;
  },
  formateDate(date, rule) {
    let fmt = rule || "yyyy-MM-dd hh:mm:ss";
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, date.getFullYear());
    }
    const o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
    };
    for (const key in o) {
      if (new RegExp(`(${key})`).test(fmt)) {
        const val = o[key] + "";
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? val : ("00" + val).substring(val.length)
        );
      }
    }
    return fmt;
  },
};
