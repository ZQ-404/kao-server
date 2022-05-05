/**
 * 用户管理模块
 */
const router = require("koa-router")();
const utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const User = require("./../models/userSchema");

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
      const data=res._doc;
       //生成token
     const token = jwt.sign(
      {
        data, //payload
      },
      "imooc", //密钥 
      { expiresIn: 30 } //30秒过期
    );
      data.token=token;
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
module.exports = router;

