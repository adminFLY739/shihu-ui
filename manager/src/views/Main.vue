<style lang="scss">
@import "./main.scss";
</style>
<template>
  <div class="main">
    <!-- 左侧导航栏 -->
    <div class="sidebar-menu-con menu-bar">
      <div class="setting-drawer-title">
        <h3 class="drawer-title">主题风格设置</h3>
      </div>
      <div class="setting-drawer-block-checbox">
        <div class="setting-drawer-block-checbox-item" @click="handleTheme('dark')">
          <img src="@/assets/images/dark.svg" alt="dark">
          <div v-if="sideTheme === 'dark'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
            <i aria-label="图标: check" class="anticon anticon-check">
              <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em"  aria-hidden="true" focusable="false" class="">
                <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
              </svg>
            </i>
          </div>
        </div>
        <div class="setting-drawer-block-checbox-item" @click="handleTheme('light')">
          <img src="@/assets/images/light.svg" alt="light">
          <div v-if="sideTheme === 'light'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
            <i aria-label="图标: check" class="anticon anticon-check">
              <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true" focusable="false" class="">
                <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
              </svg>
            </i>
          </div>
        </div>
      </div>
      <!-- 左侧菜单 -->
      <shrinkable-menu :theme2="sideTheme"></shrinkable-menu>
    </div>
    <!-- 顶部标题栏主体 -->
    <div class="main-header-con">

      <div class="main-header">
        <div
          :class="{
            'header-avator-con': navType != 4,
            'header-avator-con nav4': navType == 4,
          }"
        >
          <!-- 导航面包屑 -->
          <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

          <div class="header-avator-con">
            <div style="width: 150px" v-if="userInfo.tenantName"> 所属租户：{{userInfo.tenantName}} </div>
            <div style="width: 70px" v-else> 管理员 </div>

            <!-- 代办事项 -->
            <message-tip v-if="tipsMessage" :res="tipsMessage"></message-tip>

            <!-- 用户名字头像 -->
            <div class="user-dropdown-menu-con">
              <Row
                type="flex"
                justify="end"
                align="middle"
                class="user-dropdown-innercon"
              >
                <Dropdown
                  transfer
                  trigger="hover"
                  @on-click="handleClickUserDropdown"
                >
                  <div class="dropList">
                    <span class="main-user-name">{{ userInfo.nickName }}</span>
                    <Icon type="md-arrow-dropdown" />
                    <Avatar
                      :src="avatarPath"
                      style="background: #fff; margin-left: 10px"
                    ></Avatar>
                  </div>
                  <DropdownMenu slot="list">
                    <DropdownItem name="personalCenter">{{
                      $t("userCenter")
                    }}</DropdownItem>
                    <DropdownItem name="changePass">{{
                      $t("changePass")
                    }}</DropdownItem>
                    <DropdownItem name="loginOut" divided>{{
                      $t("logout")
                    }}</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </Row>
            </div>
          </div>
        </div>
      </div>

      <!-- 已打开的页面标签 -->
      <div class="tags-con">
        <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
      </div>

    </div>

    <!-- 菜单路由页面 -->
    <div class="single-page-con">
      <div class="single-page">
        <!-- <keep-alive :include="cachePage"> -->
        <router-view></router-view>
        <!-- </keep-alive> -->
      </div>
    </div>

    <!-- 全局加载动画 -->
    <circleLoading class="loading-position" v-show="loading" />
  </div>
</template>

<script>
import shrinkableMenu from "./main-parts/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from "./main-parts/tags-page-opened.vue";
import messageTip from "./main-parts/message-tip.vue";
import circleLoading from "@/components/lili/circle-loading.vue";
import Breadcrumb from '@/components/Breadcrumb'
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { getNoticePage, logout } from "@/api/index";
import { getBaseSite } from "@/api/common";

var client;
export default {
  components: {
    shrinkableMenu,
    tagsPageOpened,
    messageTip,
    circleLoading,
    Breadcrumb,
  },
  data() {
    return {
      sliceNum: 5, // 展示nav数量
      userInfo: "", // 用户信息
      navType: 1, // nav类型
      tipsMessage: "", // 通知消息
      domainLogo: "",
      sideTheme:"dark",//菜单主体样式
    };
  },
  computed: {
    loading() {
      return this.$store.state.app.loading;
    },
    pageTagsList() {
      return this.$store.state.app.pageOpenedList; // 打开的页面的页面对象
    },
    avatarPath() {
      return localStorage.avatorImgPath;
    },
    lang() {
      return this.$store.state.app.lang;
    },
  },

  methods: {
    init() {
      // 菜单初始化
      let userInfo = JSON.parse(Cookies.get("userInfoManager"));
       console.log(userInfo);
      this.userInfo = userInfo;
      this.checkTag(this.$route.name);
      let currWidth = document.body.clientWidth;
      if (currWidth <= 1200) {
        this.sliceNum = 2;
      }
      this.domainLogo = localStorage.getItem("icon");
      let link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.href = localStorage.getItem("domainIcon");
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);

      // 读取未读消息数
      getNoticePage({tenantId: this.userInfo.tenantId}).then((res) => {
        if (res.success) {
          this.tipsMessage = res.result;

          this.$store.state.notices = res.result;
        }
      });
    },

    handleTheme(val) {
      this.sideTheme = val;
    },

    //用户头像下方抽屉点击
    handleClickUserDropdown(name) {
      //个人中心
      if (name === "personalCenter") {
        util.openNewPage(this, "personal-center");
        this.$router.push({
          name: "personal-center",
        });
      }
      //修改密码
      else if (name === "changePass") {
        util.openNewPage(this, "change-password");
        this.$router.push({
          name: "change_password",
        });
      }
      // 退出登录
      else if (name === "loginOut") {
        logout().then((res) => {
          this.$store.commit("logout", this);
          this.$store.commit("setAdded", false);
          this.setStore("accessToken", "");
          this.setStore("refreshToken", "");
          this.$router.push({ path: "/login" });
        });
      }
    },
    //切换标签
    checkTag(name) {
      let openpageHasTag = this.pageTagsList.some((item) => {
        if (item.name == name) {
          return true;
        }
      });
      if (!openpageHasTag) {
        //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
        util.openNewPage(
          this,
          name,
          this.$route.params || {},
          this.$route.query || {}
        );
      }
    },
    //宽度动态计算
    resize() {
      let currWidth = document.body.clientWidth;
      let count = currWidth / 300;
      if (count > 6) {
        this.sliceNum = 6;
      } else {
        this.sliceNum = count;
      }
    },
  },
  watch: {
    $route(to, from) {
      this.checkTag(to.name);
      localStorage.currentPageName = to.name;
    },
  },
  mounted() {
    this.init();
    let that = this;
    this.resize();
    window.addEventListener("resize", function () {
      that.resize();
    });
  },
  created() {
    // 显示打开的页面的列表
    this.$store.commit("setOpenedList");
  },
};
</script>
