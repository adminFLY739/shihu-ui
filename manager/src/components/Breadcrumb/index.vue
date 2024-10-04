<template>
  <Breadcrumb >
    <transition-group name="breadcrumb">
        <Breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
          <span v-if="index === levelList.length - 2 || index === levelList.length - 1" class="no-redirect">{{ item.meta.title }}</span>
          <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
          <span v-if="index !== levelList.length - 1" class="xiegang" >/</span>
        </Breadcrumb-item>
      </transition-group>
  </Breadcrumb>
</template>

<script>
export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      console.log(matched)
      const first = matched[0]

      if (!this.isDashboard(first)) {
        matched = [{ path: '/', meta: { title: '首页' }}].concat(matched)
      }

      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim() === 'Index'
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
.xiegang {
  color: #97a8be;
  cursor: text;
  margin: 10px;
}
/* breadcrumb transition */
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all .5s;
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all .5s;
}

.breadcrumb-leave-active {
  position: absolute;
}

.app-breadcrumb.el-breadcrumb {
  margin-left: 8px;
}
</style>
