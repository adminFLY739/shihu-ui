<template>
  <div>

    <Card>
      <Row style="background:#eee;padding:10px; margin-bottom: 10px" v-show="showData">
        <Col span="5">
          <Card :bordered="false">
            <p slot="title">总订单数</p>
            <p>{{orderData.orderNum}}</p>
          </Card>
        </Col>
        <Col span="5" offset="1">
          <Card shadow>
            <p slot="title">未发货数</p>
            <p>{{orderData.orderUndeliverdNum}}</p>
          </Card>
        </Col>
        <Col span="5" offset="1">
          <Card shadow>
            <p slot="title">未核验数</p>
            <p>{{orderData.orderTakeNum}}</p>
          </Card>
        </Col>
        <Col span="5" offset="1">
          <Card shadow>
            <p slot="title">已完成数</p>
            <p>{{orderData.orderCompletedNum}}</p>
          </Card>
        </Col>
      </Row>
      <Form
        ref="searchForm"
        @keydown.enter.native="handleSearch"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
        v-show="showSearch"
      >
        <Form-item label="订单号" prop="orderSn">
          <Input
            type="text"
            v-model="searchForm.orderSn"
            placeholder="请输入订单号"
            clearable
            style="width: 160px"
          />
        </Form-item>
        <Form-item label="用户名称" prop="buyerName">
          <Input
            type="text"
            v-model="searchForm.buyerName"
            placeholder="请输入用户名称"
            clearable
            style="width: 160px"
          />
        </Form-item>

        <Form-item label="订单类型" prop="orderType">
          <Select
            v-model="searchForm.orderPromotionType"
            placeholder="请选择"
            clearable
            style="width: 160px"
          >
            <Option value="NORMAL">普通订单</Option>
            <Option value="PINTUAN">拼团订单</Option>
            <Option value="GIFT">赠品订单</Option>
            <Option value="POINTS">积分订单</Option>
            <Option value="KANJIA">砍价订单</Option>
          </Select>
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
            <Option value="UNDELIVERED">待发货</Option>
            <Option value="DELIVERED">已发货</Option>
            <Option value="COMPLETED">已完成</Option>
            <Option value="TAKE">待核验</Option>
            <Option value="CANCELLED">已取消</Option>
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
        <Button
          @click="handleSearch"
          type="primary"
          icon="ios-search"
          class="search-btn"
          >搜索</Button
        >
        <Button @click="resetting" class="search-btn" type="info" icon="ios-refresh">重置</Button>
      </Form>
      <Row class="operation padding-row" >
        <Col span="22">
          <download-excel
            class="export-excel-wrapper"
            :data="data"
            :fields="fields"
            :fetch="exportOrder"
            name="商品订单.xls"
          >
            <Button type="info" class="export" icon="md-arrow-round-up"> 导出订单 </Button>
          </download-excel>
        </Col>
        <Col span="2">
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getDataList" :is-show-data="true" :showData.sync="showData"></right-toolbar>
        </Col>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
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
import * as API_Order from "@/api/order";
import JsonExcel from "vue-json-excel";
import RightToolbar from "@/components/RightToolbar/index.vue";
import Cookies from "js-cookie";
import {homeStatistics} from "@/api";
import {getOrderData} from "@/api/order";
export default {
  name: "orderList",
  components: {
    RightToolbar,
    "download-excel": JsonExcel,
  },
  data() {
    return {
      showSearch: true,
      showData: true,
      userInfo: JSON.parse(Cookies.get("userInfoManager")),
      orderData:{},
      // 表格的表头以及内容
      fields: {
        订单编号: "sn",
        下单时间: "createTime",
        客户名称: "memberName",
        支付方式: {
          field: "clientType",
          callback: (value) => {
            if (value == "H5") {
              return "移动端";
            } else if (value == "PC") {
              return "PC端";
            } else if (value == "WECHAT_MP") {
              return "小程序端";
            } else if (value == "APP") {
              return "移动应用端";
            } else {
              return value;
            }
          },
        },
        商品数量: "groupNum",
        付款状态: {
          field: "payStatus",
          callback: (value) => {
            return value == "UNPAID"
              ? "未付款"
              : value == "PAID"
              ? "已付款"
              : "";
          },
        },
        店铺: "storeName",
      },
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
        orderType: "",
        orderSn: "",
        buyerName: "",
        orderStatus: "",
        orderPromotionType:"",
      },
      selectDate: null,
      columns: [
        {
          title: "订单号",
          key: "sn",
          minWidth: 240,
          tooltip: true,
        },

        {
          title: "订单来源",
          key: "clientType",
          width: 120,
          render: (h, params) => {
            if (params.row.clientType == "H5") {
              return h("div", {}, "移动端");
            } else if (params.row.clientType == "PC") {
              return h("div", {}, "PC端");
            } else if (params.row.clientType == "WECHAT_MP") {
              return h("div", {}, "小程序端");
            } else if (params.row.clientType == "APP") {
              return h("div", {}, "移动应用端");
            } else {
              return h("div", {}, params.row.clientType);
            }
          },
        },
        {
          title: "订单类型",
          key: "orderPromotionType",
          width: 120,
          render: (h, params) => {
            if (params.row.orderPromotionType == "NORMAL") {
              return h("div", [
                h("tag", { props: { color: "blue" } }, "普通订单"),
              ]);
            } else if (params.row.orderPromotionType == "PINTUAN") {
              return h("div", [
                h("tag", { props: { color: "volcano" } }, "拼团订单"),
              ]);
            } else if (params.row.orderPromotionType == "GIFT") {
              return h("div", [
                h("tag", { props: { color: "green" } }, "赠品订单"),
              ]);
            } else if (params.row.orderPromotionType == "POINTS") {
              return h("div", [
                h("tag", { props: { color: "geekblue" } }, "积分订单"),
              ]);
            } else if (params.row.orderPromotionType == "KANJIA") {
              return h("div", [
                h("tag", { props: { color: "pink" } }, "砍价订单"),
              ]);
            }
          },
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
              this.$options.filters.unitPrice(params.row.flowPrice, "￥")
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
            } else if (params.row.orderStatus == "UNDELIVERED") {
              return h("div", [
                h("tag", { props: { color: "geekblue" } }, "待发货"),
              ]);
            } else if (params.row.orderStatus == "DELIVERED") {
              return h("div", [
                h("tag", { props: { color: "cyan" } }, "已发货"),
              ]);
            } else if (params.row.orderStatus == "COMPLETED") {
              return h("div", [
                h("tag", { props: { color: "green" } }, "已完成"),
              ]);
            } else if (params.row.orderStatus == "TAKE") {
              return h("div", [
                h("tag", { props: { color: "volcano" } }, "待核验"),
              ]);
            } else if (params.row.orderStatus == "CANCELLED") {
              return h("div", [
                h("tag", { props: { color: "red" } }, "已取消"),
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
            return h(
              "Button",
              {
                props: { type: "info", size: "small" },
                style: { marginRight: "5px" },
                on: {
                  click: () => {
                    this.detail(params.row);
                  },
                },
              },
              "查看"
            );
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
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    //重置搜索条件
    resetting(){
      this.$refs.searchForm.resetFields();
      this.selectDate=null;
      this.searchForm.startDate="";
      this.searchForm.endDate="";
      this.searchForm.orderPromotionType="";
      this.searchForm.serviceStatus="";
      this.handleSearch();
    },
    // 起止时间从新赋值
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    // 获取列表数据
    getDataList() {
      this.loading = false;
      API_Order.getOrderList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = true;
    },
    // 跳转详情页面
    detail(v) {
      let sn = v.sn;
      this.$router.push({
        name: "order-detail",
        query: { sn: sn },
      });
    },
    // 导出订单
    async exportOrder() {
      const params = JSON.parse(JSON.stringify(this.searchForm));
      params.pageNumber = 1;
      params.pageSize = 10000;
      const result = await API_Order.getOrderList(params);
      if (result.success) {
        if (result.result.records.length === 0) {
          this.$Message.warning("暂无待发货订单");
          return [];
        } else {
          return result.result.records;
        }
      } else {
        this.$Message.warning("导出订单失败，请重试");
      }
    },
    //订单统计数据
    async getOrderDatas() {
      let res = await getOrderData({tenantId: this.userInfo.tenantId});
      if (res.success) {
        this.orderData = res.result;
      }
    },
  },


  mounted() {
    if(!this.userInfo.isSuper&&this.userInfo.tenantId){
      this.searchForm.tenantId=this.userInfo.tenantId;
    }
    this.getOrderDatas();
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.export {
  margin: 0px 0px 0px 0;
}
.export-excel-wrapper {
  display: inline;
}
</style>
