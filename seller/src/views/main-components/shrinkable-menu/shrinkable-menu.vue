<template>
  <div  class="ivu-shrinkable-menu">
    <Menu ref="sideMenu" width="200px" :theme="theme2"   @on-open-change="selectNav" @on-select="changeMenu" :accordion="true">
      <Submenu  v-for="(item, i) in menuAllList" :key="i" :name="item.name">
        <template slot="title">
          <Icon :type='selectName===item.name?"logo-reddit":"ios-ionitron-outline"' />
          {{item.title}}
        </template>
        <MenuGroup :title="itemChild.title" :key="itemChild.id" style="padding-left:0;"
                   :active-name="$route.name"
                   v-for="itemChild in item.children"
        >
          <MenuItem :name="menu.name" v-for="menu in itemChild.children" :key="menu.name" style="margin-left: 10px">
            {{menu.title}}
          </MenuItem>
        </MenuGroup>
      </Submenu>
    </Menu>
  </div>
</template>

<script>
import util from "@/libs/util.js";

export default {
  name: "shrinkableMenu",
  data(){
    return{
      selectName:"",
    }
  },

  props:["theme2"],
  computed: {
    menuList() {
      return this.$store.state.app.menuList;
    },
    navList() {
      return this.$store.state.app.navList;
    },
    currNav() {
      return this.$store.state.app.currNav;
    },
    menuAllList(){
      return this.$store.state.app.menuAllList;
    }

  },
  watch: {
    // 监听路由变化
    $route: {
      handler: function (val, oldVal) {
        if (val.meta.firstRouterName && val.meta.firstRouterName !== this.currNav) {
          this.selectNav(val.meta.firstRouterName)
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
      this.$store.commit("setCurrNav", name[0]);
      this.setStore("currNav", name[0]);
      util.initRouter(this);
      this.$nextTick(()=>{
        this.$refs.sideMenu.updateActiveName()
      })
      this.selectName=name[0];
    },
  }
};
</script>
<style lang="scss" scoped>
.ivu-shrinkable-menu{
  height: calc(100% - 60px);
  width: 185px;
  display: flex;
}

.ivu-btn-text:hover {
  background-color: rgba(255,255,255,.2) !important;
}
.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu), .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title-active:not(.ivu-menu-submenu){
  background-color: #fff;
  &:hover{
    background-color: #fff;
  }
}
.ivu-menu-vertical{
  overflow-y: auto;
}

/deep/.ivu-menu-vertical .ivu-menu-item-group-title {
  height: 40px;
  line-height: 40px;
  padding-left: 20px;
}
</style>
