/**
 * 通用的工具函数
 */
const log4js=require('./log4j')
const CODE ={
    SUCCESS:200,
    PARAM_ERROR:1001,//参数错误
    USER_ACCOUNT_ERROR:2001,//账号或密码错误
    USER_LOGIN_ERROR:3001,//用户未登录
    BUSIESS_ERROR:4001,//业务请求失败
    AUTH_ERROR:5001,//认证失败或者TOKEN过期
}
module.exports={
    /**
     * 分页结构封装
     * @param {number} pageNum 
     * @param {number} pageSize 
     */
    pager({pageNum=1,pageSize=10}){
        pageNum*=1;
        pageSize*=1;
        const skipIndex=(pageNum-1)*pageSize;//计算第二页从什么索引开始
        return{
            page:{
                pageNum,
                pageSize,
            },
            skipIndex
        }
    },
    success(data='',msg='',code=CODE.SUCCESS){
        log4js.debug(data)
        return{
            data,msg,code
        }

    },
    fail(msg='',code=CODE.BUSIESS_ERROR,data=''){
        log4js.debug(msg)
        return{
            code,data,msg
        }

    },
}