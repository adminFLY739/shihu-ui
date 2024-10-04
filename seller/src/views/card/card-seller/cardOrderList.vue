<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="80"
        class="search-form"
        v-show="showSearch"
      >
        <Form-item label="订单编号" prop="sn">
          <Input
            type="text"
            v-model="searchForm.sn"
            clearable
            placeholder="请输入订单编号"
            style="width: 160px"
          />
        </Form-item>
        <Form-item label="用户名称" prop="memberName">
          <Input
            type="text"
            v-model="searchForm.memberName"
            clearable
            placeholder="请输入用户名称"
            style="width: 160px"
          />
        </Form-item>
        <Form-item label="卡券名称" prop="cardName">
          <Input
            type="text"
            v-model="searchForm.cardName"
            clearable
            placeholder="请输入卡券名称"
            style="width: 160px"
          />
        </Form-item>
        <Form-item label="提货码" prop="deliveryCode">
          <Input
            type="text"
            v-model="searchForm.deliveryCode"
            clearable
            placeholder="请输入提货码"
            style="width: 160px"
          />
        </Form-item>
        <Form-item label="订单状态" prop="orderStatus">
          <Select
            v-model="searchForm.orderStatus"
            placeholder="请选择"
            clearable
            style="width: 160px"
          >
            <Option value="UNPAID">未付款</Option>
            <Option value="PAID">已付款</Option>
          </Select>
        </Form-item>
        <Form-item label="下单时间">
          <DatePicker
            v-model="selectDate"
            type="datetimerange"
            format="yyyy-MM-dd"
            clearable
            @on-change="selectDateRange"
            placeholder="选择起始时间"
            style="width: 160px"
          ></DatePicker>
        </Form-item>
        <Button @click="handleSearch" type="primary" class="search-btn" icon="ios-search">搜索</Button>
        <Button @click="handleReset" class="search-btn" icon="md-refresh">重置</Button>
      </Form>
      <Row class="operation padding-row" >
        <Col span="22">
        </Col>
        <Col span="2">
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getDataList"  :showData.sync="showData"></right-toolbar>
        </Col>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
      ></Table>
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
import JsonExcel from "vue-json-excel";
import RightToolbar from "@/components/RightToolbar/index.vue";
import {getStoreCardOrderList} from "@/api/card";
export default {
  name: "orderList",
  components: {
    RightToolbar,
    "download-excel": JsonExcel,
  },
  data() {
    return {
      loading: true, // 表单加载状态
      showSearch:true,
      showData:true,
      orderData:{},
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: 'createTime',
        order: 'desc',
        startDate: "", // 起始时间
        endDate: "", // 终止时间
        sn: "",
        cardName:"",
        orderStatus: "",
        deliveryCode:"",
      },
      selectDate: null,
      columns: [
        {
          title: "订单号",
          key: "sn",
          minWidth: 200,
          tooltip: true,
        },
        {
          title: "卡券名称",
          key: "cardName",
          minWidth: 130,
          tooltip: true,
        },
        {
          title: "提货码",
          key: "deliveryCode",
          minWidth: 130,
          tooltip: true,
        },
        {
          title: "买家名称",
          key: "memberName",
          minWidth: 130,
          tooltip: true,
        },
        {
          title: "订单金额",
          key: "flowPrice",
          minWidth: 100,
          tooltip: true,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.price, "￥")
            );
          },
        },

        {
          title: "订单状态",
          key: "orderStatus",
          minWidth: 100,
          render: (h, params) => {
            if (params.row.orderStatus == "UNPAID") {
              return h("div", [
                h("tag", { props: { color: "magenta" } }, "未付款"),
              ]);
            } else if (params.row.orderStatus == "PAID") {
              return h("div", [
                h("tag", { props: { color: "blue" } }, "已付款"),
              ]);
            }
          },
        },
        {
          title: "下单时间",
          key: "createTime",
          width: 170,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.detail(params.row,'only');
                    },
                  },
                },
                "查看卡券"
              ),
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索订单
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 重置
    handleReset() {
      this.searchForm = {};
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      // 重新加载数据
      this.getDataList();
    },
    // 起始时间处理
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取表格数据
    getDataList() {
      this.loading = true;
      getStoreCardOrderList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },

    // 查看订单详情
    detail(v,only) {
        let data;
        only ? (data = { onlyView: true, id: v.cardId }) : (data = { id: v.cardId });
        this.$router.push({ name: "add-card", query: data });
    },
  },
  mounted() {
    this.init();
  },
  // 页面缓存处理，从该页面离开时，修改KeepAlive为false，保证进入该页面是刷新
  beforeRouteLeave(to, from, next) {
    from.meta.keepAlive = false;
    next();
  },
};
</script>
<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
@import "@/styles/table-common.scss";
.export {
  margin: 10px 20px 10px 0;
}
</style>
