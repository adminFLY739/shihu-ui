<template>
  <div class="top-right-btn" :style="style">
    <Row>
      <Tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top" v-if="search">
        <Button  shape="circle"  icon="ios-search" @click="toggleSearch()" />
      </Tooltip>
      <Tooltip class="item" effect="dark" content="刷新" placement="top">
        <Button  shape="circle"  circle icon="ios-refresh" @click="refresh()" />
      </Tooltip>
      <Tooltip class="item" effect="dark" :content="showSearch ? '隐藏数据' : '显示数据'" placement="top"  v-if="isShowData">
        <Button  shape="circle"  icon="md-card  " @click="toggleData()" />
      </Tooltip>
    </Row>
  </div>
</template>
<script>
export default {
  name: "RightToolbar",
  data() {
    return {
      // 显隐数据
      value: [],
      // 弹出层标题
      title: "显示/隐藏",
      // 是否显示弹出层
      open: false,
    };
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    showData: {
      type: Boolean,
      default: true,
    },
    isShowData: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Array,
    },
    search: {
      type: Boolean,
      default: true,
    },
    gutter: {
      type: Number,
      default: 10,
    },
  },
  computed: {
    style() {
      const ret = {};
      if (this.gutter) {
        ret.marginRight = `${this.gutter / 2}px`;
      }
      return ret;
    }
  },
  created() {
    // 显隐列初始默认隐藏列
    for (let item in this.columns) {
      if (this.columns[item].visible === false) {
        this.value.push(parseInt(item));
      }
    }
  },
  methods: {
    // 搜索
    toggleSearch() {
      this.$emit("update:showSearch", !this.showSearch);
    },
    // 刷新
    refresh() {
      this.$emit("queryTable");
    },

    //数据
    toggleData() {
      this.$emit("update:showData", !this.showData);
    },

  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-transfer__button {
  border-radius: 50%;
  padding: 12px;
  display: block;
  margin-left: 0px;
}
::v-deep .el-transfer__button:first-child {
  margin-bottom: 10px;
}
</style>
