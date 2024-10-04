<template>
  <div class="search">
    <Card>
      <Row>
        <Form
          ref="searchForm"
          :model="searchForm"
          inline
          :label-width="100"
          class="search-form"
          v-show="showSearch"
        >
          <Form-item label="卡券名称">
            <Input
              type="text"
              v-model="searchForm.cardName"
              placeholder="请输入卡券名称"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="活动状态" prop="promotionStatus">
            <Select
              v-model="searchForm.promotionStatus"
              placeholder="请选择"
              clearable
              style="width: 200px"
            >
              <Option value="NEW">未开始</Option>
              <Option value="START">已开始/上架</Option>
              <Option value="END">已结束/下架</Option>
              <Option value="CLOSE">紧急关闭/作废</Option>
            </Select>
          </Form-item>
          <Form-item label="活动时间">
            <DatePicker
              v-model="selectDate"
              type="daterange"
              clearable
              placeholder="选择起始时间"
              style="width: 200px"
            ></DatePicker>
          </Form-item>
          <Button
            @click="handleSearch"
            type="primary"
            class="search-btn"
            icon="ios-search"
            >搜索</Button
          >
          <Button @click="handleReset" class="search-btn" icon="md-refresh">重置</Button>
        </Form>
      </Row>
      <Row class="operation padding-row" >
        <Col span="22">
          <Button @click="add" type="primary" icon="md-add">添加</Button>
          <Button @click="delAll" class="ml_10" icon="md-power">批量关闭</Button>
        </Col>
        <Col span="2">
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getDataList"></right-toolbar>
        </Col>
      </Row>
      <Table
        class="mt_10"
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        @on-selection-change="changeSelect"
      >
        <!-- 商品栏目格式化 -->
        <template slot="cardSlot" slot-scope="{ row }">
          <div style="margin-top: 5px; height: 90px; display: flex">
            <div style="">
              <img
                :src="row.image"
                style="height: 80px; margin-top: 3px; width: 150px"
              />
            </div>
          </div>
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button
            v-if="
              row.promotionStatus === 'NEW' || row.promotionStatus === 'CLOSE'
            "
            type="info"
            size="small"
            @click="see(row)"
            >编辑</Button
          >
          <Button v-else type="default" size="small" @click="see(row, 'only')"
            >查看</Button
          >
          <Button
            v-if="
              row.promotionStatus === 'START' || row.promotionStatus === 'NEW'
            "
            type="error"
            size="small"
            :style="{ marginLeft: '5px' }"
            @click="remove(row)"
            >关闭</Button
          >
        </template>
      </Table>
      <Row type="flex" justify="center" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="default"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>
  </div>
</template>

<script>

import {
  promotionsStatusRender,
} from "@/utils/promotions";
import RightToolbar from "@/components/RightToolbar/index.vue";
import {getCardList, updateCardStatus} from "@/api/card";

export default {
  name: "coupon",
  components: {RightToolbar},
  data() {
    return {
      selectDate: [],
      loading: true, // 表单加载状态
      showSearch: true,
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "startTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left",
        },
        {
          title: "卡券名称",
          key: "cardName",
          width: 300,
          tooltip: true,
        },
        {
          title: "卡券图片",
          key: "image",
          width: 250,
          slot: "cardSlot",
        },
        {
          title: "价格",
          key: "price",
          width: 150,
          render: (h, params) => {
            if (params.row.price) {
              return h(
                "div",
                this.$options.filters.unitPrice(params.row.price || 0, "￥")
              );
            } else {
              return h("div", (params.row.couponDiscount || 0) + "折");
            }
          },
        },

        {
          title: "已使用数量/总数量",
          key: "publishNum",
          width: 200,
          render: (h, params) => {
            return h(
              "div",
              params.row.usedNum +
                "/" +
                (params.row.publishNum === 0 ? "不限制" : params.row.publishNum)
            );
          },
        },
        {
          title: "活动时间",
          width: 230,
          render: (h, params) => {
            if (
              params?.row?.getType === "ACTIVITY" &&
              params?.row?.rangeDayType === "DYNAMICTIME"
            ) {
              return h("div", "长期有效");
            } else if (params?.row?.startTime && params?.row?.endTime) {
              return h("div", {
                domProps: {
                  innerHTML:
                    params.row.startTime + "<br/>" + params.row.endTime,
                },
              });
            }
          },
        },
        {
          title: "状态",
          width: 200,
          key: "promotionStatus",
          fixed: "right",
          render: (h, params) => {
            return promotionsStatusRender(h, params);
          },
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          fixed: "right",
          maxWidth: 250,
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    receivePage(id) {
      if (id) {
        this.$router.push({ name: "coupon-receive", query: { couponId: id } });
      } else {
        this.$router.push({ name: "coupon-receive" });
      }
    },
    add() {
      this.$router.push({ name: "add-card" });
    },
    /** 跳转至领取详情页面 */
    receiveInfo(v) {
      this.$router.push({ name: "member-receive-coupon", query: { id: v.id } });
    },
    info(v) {
      this.$router.push({ name: "platform-coupon-info", query: { id: v.id } });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleReset() {
      this.searchForm = {};
      this.selectDate = "";
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    // 获取列表数据
    getDataList() {
      this.loading = false;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = this.selectDate[0].getTime();
        this.searchForm.endTime = this.selectDate[1].getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getCardList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = true;
    },
    // 跳转编辑优惠券页面
    see(v, only) {
      let data;
      only ? (data = { onlyView: true, id: v.id }) : (data = { id: v.id });
      this.$router.push({ name: "add-card", query: data });
    },
    // 下架优惠券
    remove(v) {
      this.$Modal.confirm({
        title: "确认下架",
        content: "确认要下架此卡券么?",
        loading: true,
        onOk: () => {
          this.loading = false;
          let params = {
            cardIds: v.id,
          };
          updateCardStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },

    // 批量下架
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要关闭的优惠券");
        return;
      }
      this.$Modal.confirm({
        title: "确认关闭",
        content: "您确认要关闭所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });

          let params = {
            cardIds: ids.toString(),
          };
          updateCardStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.search-form {
  width: 100% !important;
}
</style>
