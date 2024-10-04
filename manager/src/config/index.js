module.exports = {
  title: "xxxshop", //配置显示在浏览器标签的title
  /**
   * 高德地图申请链接
   * https://lbs.amap.com/api/javascript-api/guide/abc/prepare
   * 添加成功后，可获取到key值和安全密钥jscode（自2021年12月02日升级，升级之后所申请的 key 必须配备安全密钥 jscode 一起使用)
   */
  //FIXME 请检查当前高德key创建的日期，如果2021年12月02日之前申请的 无需填写安全密钥
  aMapSecurityJsCode:"5983fe2f1e817b373c5663b84750dd87", // 高德web端js申请的安全密钥
  aMapKey: "d7d7e98e352184b4ab85b913c7ceab18", //高德web端js申请的api key
  website: "https://www.pickmall.cn", //官网地址
  enableCDN: true, //生产环境 是否启用cdn加载 vue等js
  port: 10003, //端口
};
