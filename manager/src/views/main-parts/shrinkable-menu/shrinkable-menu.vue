<template>
  <div class="ivu-shrinkable-menu">
    <Menu ref="sideMenu" width="200px" :theme="theme2" :active-name="currNav" @on-open-change="selectNav" @on-select="changeMenu" :accordion="true">
      <Submenu v-for="(item, i) in menuAllList" :key="i" :name="item.name">

        <!-- 一级菜单标题 -->
        <template slot="title">
          <Icon :type='selectName === item.name ? "logo-reddit" : "ios-ionitron-outline"' />
          {{ item.title }}
        </template>

        <!-- 二级菜单标题 -->
        <MenuGroup :title="itemChild.title" :key="itemChild.id" style="padding-left:0;" :active-name="$route.name" v-for="itemChild in item.children">
          <!-- 二级菜单 -->
          <MenuItem :name="menu.name" v-for="menu in itemChild.children" :key="menu.name" style="margin-left: 10px">
            {{ menu.title }}
          </MenuItem>
        </MenuGroup>
      </Submenu>
    </Menu>
  </div>
</template>

<script>
import util from "@/libs/util.js";

export default {
  name: "shrinkableMenu",  // 组件名称为"shrinkableMenu"
  data() {
    return {
      selectName: "",  // 初始化selectName为空字符串
    }
  },

  props: ["theme2"],  // 接收名为"theme2"的props属性
  computed: {
    menuList() {
      return this.$store.state.app.menuList;  // 获取store中app模块的menuList状态值
    },
    navList() {
      return this.$store.state.app.navList;  // 获取store中app模块的navList状态值
    },
    currNav() {
      return this.$store.state.app.currNav;  // 获取store中app模块的currNav状态值
    },
    menuAllList() {
      return this.$store.state.app.menuAllList;  // 获取store中app模块的menuAllList状态值
    }

  },
  watch: {
    // 监听路由变化
    $route: {
      handler: function (val, oldVal) {
        if (val.meta.firstRouterName && val.meta.firstRouterName !== this.currNav) {
          // 如果当前路由的meta中有firstRouterName属性且与currNav不相等
          this.selectNav(val.meta.firstRouterName);  // 调用selectNav方法设置当前导航为firstRouterName的值
        }
      }
    }
  },
  methods: {
    changeMenu(name) { //二级路由点击
      this.$router.push({
        name: name
      });
    },
    selectNav(name) { // 一级路由点击事件
      this.$store.commit("setCurrNav", name[0]);  // 调用setCurrNav方法将name[0]设置为currNav的值
      this.setStore("currNav", name[0]);  // 调用setStore方法将name[0]保存到"currNav"中
      util.initRouter(this);  // 调用util对象的initRouter方法初始化路由
      this.$nextTick(() => {
        this.$refs.sideMenu.updateActiveName();  // 在下一次DOM更新循环中，调用sideMenu组件的updateActiveName方法更新激活菜单项
      });
      this.selectName = name[0];  // 将selectName设置为name[0]
    },
  }
};
</script>
<style lang="scss" scoped>
.ivu-shrinkable-menu {
  height: calc(100% - 60px);
  width: 180px;
  display: flex;
}

.ivu-btn-text:hover {
  background-color: rgba(255, 255, 255, .2) !important;
}

.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu),
.ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title-active:not(.ivu-menu-submenu) {
  background-color: #fff;

  &:hover {
    background-color: #fff;
  }
}

.ivu-menu-vertical {
  overflow-y: auto;
}

/deep/.ivu-menu-vertical .ivu-menu-item-group-title {
  height: 40px;
  line-height: 40px;
  padding-left: 20px;
}</style>
