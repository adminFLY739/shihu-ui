<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form" v-show="showSearch">
          <Form-item label="订单号" prop="orderSn">
            <Input
              type="text"
              v-model="searchForm.orderSn"
              placeholder="请输入订单号"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="用户名称" prop="buyerName">
            <Input
              type="text"
              v-model="searchForm.buyerName"
              placeholder="请输入用户名称"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="订单状态" prop="orderStatus">
            <Select v-model="searchForm.orderStatus" placeholder="请选择" clearable style="width: 200px">
              <Option value="CONFIRM">已确认</Option>
              <Option value="TAKE">待核验</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="WAIT_PINTUAN">待成团</Option>
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
              style="width: 200px"
            ></DatePicker>
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
          <Button @click="resetting" class="search-btn" type="info" icon="ios-refresh">重置</Button>
        </Form>
      </Row>
      <Row class="operation padding-row" >
        <Col span="22">
        </Col>
        <Col span="2">
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getDataList"></right-toolbar>
        </Col>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10"
        sortable="custom"
        @on-sort-change="changeSort"
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
  import RightToolbar from "@/components/RightToolbar/index.vue";
  import Cookies from "js-cookie";

  export default {
    name: "fictitiousOrderList",
    components: {RightToolbar},
    data() {
      return {
        loading: true, // 表单加载状态
        showSearch: true,
        userInfo: JSON.parse(Cookies.get("userInfoManager")),
        searchForm: {
          // 搜索框初始化对象
          pageNumber: 1, // 当前页数
          pageSize: 10, // 页面大小
          sort: "", // 默认排序字段
          order: "", // 默认排序方式
          startDate: "", // 起始时间
          endDate: "", // 终止时间
          orderType: "VIRTUAL",
          orderSn: "",
          buyerName: "",
          orderStatus: ""
        },

        selectDate: null, // 下单时间
        columns: [
          {
            title: "订单号",
            key: "sn",
            minWidth: 230,
            tooltip: true
          },
          {
            title: "下单时间",
            key: "createTime",
            width: 200,
          },
          {
            title: "订单来源",
            key: "clientType",
            width: 95,
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
            title: "买家名称",
            key: "memberName",
            width: 130,
          },
          {
            title: "订单金额",
            key: "flowPrice",
            minWidth: 120,
            sortable: true,
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
            width:95,
            render: (h, params) => {
              if (params.row.orderStatus == "UNPAID") {
                return h("div", [h("tag", {props: {color: "magenta"}}, "未付款")]);
              } else if (params.row.orderStatus == "PAID") {
                return h("div", [h("tag", {props: {color: "blue"}}, "已付款")]);
              } else if (params.row.orderStatus == "COMPLETED") {
                return h("div", [h("tag", {props: {color: "green"}}, "已完成")]);
              } else if (params.row.orderStatus == "TAKE") {
                return h("div", [h("tag", {props: {color: "volcano"}}, "待核验")]);
              } else if (params.row.orderStatus == "CANCELLED") {
                return h("div", [h("tag", {props: {color: "red"}}, "已取消")]);
              }
            }
          },

          {
            title: "操作",
            key: "action",
            align: "center",
            width: 200,
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",

                  {
                    props: {
                      type: "primary",
                      size: "small",
                    },
                    attrs: {
                      disabled: params.row.orderStatus == "UNPAID" ? false : true,
                    },
                    style: {
                      marginRight: "5px",
                    },
                    on: {
                      click: () => {
                        this.confirmPrice(params.row);
                      },
                    },
                  },
                  "收款"
                ),
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
                        this.detail(params.row);
                      },
                    },
                  },
                  "查看"
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
        this.handleSearch();
      },
      // 列表排序
      changeSort(e) {
        this.searchForm.sort = e.key;
        this.searchForm.order = e.order;
        if (e.order === "normal") {
          this.searchForm.order = "";
        }
        this.getDataList();
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
      //确认收款
      confirmPrice(v) {
        this.$Modal.confirm({
          title: "确认收款",
          content: "您确定要收款吗？",
          loading: true,
          onOk: () => {
            API_Order.orderPay(v.sn).then(res => {
              if(res.success){
                this.$Message.success("收款成功")
                this.getDataList()
              }
              this.$Modal.remove();
            })
          },
        });

      },
      // 订单详情
      detail(v) {
        let sn = v.sn;
        this.$router.push({
          name: "order-detail",
          query: {sn: sn},
        });

      },
    },
    mounted() {
      if(!this.userInfo.isSuper&&this.userInfo.tenantId){
        this.searchForm.tenantId=this.userInfo.tenantId;
      }
      this.init();
    },
  };
</script>
