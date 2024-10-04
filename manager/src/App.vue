<template>
  <div id="main" class="app-main">
    <router-view></router-view>
  </div>
</template>

<script>
import { getCategoryTree } from '@/api/goods.js'  // 导入从goods.js中的getCategoryTree方法
import Cookies from "js-cookie";  // 导入js-cookie库

export default {
  data() {
    return {
      userInfo: JSON.parse(Cookies.get("userInfoManager")),  // 从cookie中获取保存的用户信息，并将其解析为JSON格式赋给userInfo
    }
  },
  updated() {
    // 在组件更新时执行以下操作
    if (!localStorage.getItem('category') && this.$route.path !== '/login') {
      // 如果localStorage中没有名为'category'的项且当前路由不是'/login'
      let tenantId;
      if (!this.userInfo.isSuper && this.userInfo.tenantId) {
        // 如果用户非超级管理员且存在tenantId，则将tenantId赋给变量tenantId
        tenantId = this.userInfo.tenantId;
      } else {
        tenantId = "0";  // 否则，将tenantId设置为0
      }
      // 调用getCategoryTree方法，传入tenantId作为参数，获取商品分类树
      getCategoryTree(tenantId).then(res => {
        if (res.success) {
          // 如果请求成功，则将返回结果存储在localStorage的'category'中
          localStorage.setItem('category', JSON.stringify(res.result));
        }
      });
    }
  },
};
</script>


<style>
html,
body {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  font-size: 12px;
}

.app-main {
  width: 100%;
  height: 100%;
}

.br button {
  margin-right: 5px;
}

.operation button {
  margin-right: 5px;
}

.ivu-btn-text:focus {
  box-shadow: none !important;
}

.ivu-tag {
  cursor: pointer;
}

.tox-notifications-container {
  display: none !important;
}
</style>
