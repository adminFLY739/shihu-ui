<template>
  <div class="top-right-btn" :style="style">
    <Row>
      <Tooltip class="item" effect="dark" content="刷新" placement="top">
        <Button shape="circle" icon="ios-refresh" @click="refresh()" />
      </Tooltip>
    </Row>
  </div>
</template>

<script>
export default {
  name: "RightToolbar",
  props: {
    search: {
      type: Boolean,
      default: false,
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
  methods: {
    refresh() {
      this.$emit("queryTable");
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
