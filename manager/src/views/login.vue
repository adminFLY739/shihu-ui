<template>
  <div class="login">
    <Form ref="loginForm" :model="form" :rules="rules" class="login-form">
      <h3 class="title">商城管理系统</h3>
      <Form-item prop="username">
        <Input v-model="form.username" prefix="ios-contact" type="text" auto-complete="off" placeholder="账号">
        </Input>
      </Form-item>
      <Form-item prop="password">
        <Input v-model="form.password" type="password" auto-complete="off" placeholder="密码" prefix="ios-lock"
          @keyup.enter="handleLogin">
        </Input>
      </Form-item>
      <Form-item prop="code" v-if="captchaEnabled">
        <Input v-model="form.code" auto-complete="off" placeholder="验证码" style="width: 63%" @keyup.enter="handleLogin">
        <!--          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />-->
        </Input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </Form-item>
      <Checkbox v-model="form.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</Checkbox>
      <Form-item style="width:100%;">
        <Button :loading="loading" size="default" type="primary" style="width:100%;" @click.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </Button>
      </Form-item>
    </Form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span></span>
    </div>
  </div>
</template>

<script>
import { login, userInfo } from "@/api/index";
import { getCodeImg } from "@/api/common";
import Cookies from "js-cookie";
import Footer from "@/views/main-parts/footer";
import LangSwitch from "@/views/main-parts/lang-switch";
import util from "@/libs/util.js";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  components: {
    LangSwitch,
    Footer,
  },
  data() {
    return {
      loading: false, // 加载状态
      // 验证码开关
      captchaEnabled: true,
      codeUrl: "",
      form: {
        // 表单数据
        username: "",
        password: "",
        mobile: "",
        code: "",
        rememberMe: false,
      },
      rules: {
        // 验证规则
        username: [
          {
            required: true,
            message: "账号不能为空",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "密码不能为空",
            trigger: "blur",
          },
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
    };
  },
  //页面初始化
  mounted() {
    this.getCode();
    this.getCookie();
  },
  methods: {
    afterLogin(res) {
      // 登录成功后处理
      let accessToken = res.result.accessToken;
      let refreshToken = res.result.refreshToken;
      this.setStore("accessToken", accessToken);
      this.setStore("refreshToken", refreshToken);
      // 获取用户信息
      userInfo().then((res) => {
        if (res.success) {
          // 加载菜单
          Cookies.set("userInfoManager", JSON.stringify(res.result));
          util.initRouter(this);
          this.$store.commit("setAvatarPath", res.result.avatar);
          //跳转到首页
          this.$router.push({
            name: 'home_index'
          });
        } else {
          this.loading = false;
        }
      });
    },
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.result.img;//目的是将一些小的数据，直接嵌入到网页中，从而不用再从外部文件载入。减少对 HTTP 的请求次数。达到优化网页的效果。
        }
      });
    },
    getCookie() {
      const username = Cookies.get("manager_username");
      const password = Cookies.get("manager_password");
      const rememberMe = Cookies.get('manager_rememberMe')
      this.form = {
        username: username === undefined ? this.form.username : username,
        password: password === undefined ? this.form.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
    },
    handleLogin() {
      // 使用this.$refs.loginForm调用表单验证方法validate，并传入回调函数valid
      this.$refs.loginForm.validate(valid => {
        // 如果表单验证通过
        if (valid) {
          this.loading = true;

          // 如果选择了记住我选项
          if (this.form.rememberMe) {
            // 使用Cookies.set方法设置cookie，保存用户名和加密后的密码，并设置过期时间为30天
            Cookies.set("manager_username", this.form.username, { expires: 30 });
            Cookies.set("manager_password", encrypt(this.form.password), { expires: 30 });
            Cookies.set('manager_rememberMe', this.form.rememberMe, { expires: 30 });
          } else {
            // 如果没有选择记住我选项，使用Cookies.remove方法移除保存的用户名、密码和记住我信息
            Cookies.remove("manager_username");
            Cookies.remove("manager_password");
            Cookies.remove('manager_rememberMe');
          }

          // 创建一个FormData实例fd，并将用户名、密码和验证码数据添加到fd中
          let fd = new FormData();
          fd.append("username", this.form.username);
          fd.append("password", this.md5(this.form.password));
          fd.append("code", this.form.code);

          // 调用login方法，传入fd作为参数进行登录请求
          login(fd)
            .then((res) => {
              if (res && res.success) {
                // 登录成功后执行的操作
                this.afterLogin(res);
              } else {
                // 登录失败，停止加载，重新获取验证码
                this.loading = false;
                this.getCode();
              }
            })
            .catch(() => {
              // 发生错误，停止加载
              this.loading = false;
            });
        }
      });
    },

  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 38px;

    input {
      height: 38px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 38px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 38px;
}
</style>

