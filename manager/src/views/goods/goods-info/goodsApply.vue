<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        @keydown.enter.native="handleSearch"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
        v-show="showSearch"
      >
        <Form-item label="商品名称" prop="goodsName">
          <Input
            type="text"
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="商品编号" prop="id">
          <Input
            type="text"
            v-model="searchForm.id"
            placeholder="请输入商品编号"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="所属租户" prop="tenantId" v-if="userInfo.isSuper">
          <Select
            v-model="searchForm.tenantId"
            placeholder="请选择"
            clearable
            style="width: 160px"
          >
            <Option :value="item.id" v-for="item in tenantList" :key="item.id" :name="item.name">{{item.name}}</Option>
          </Select>
        </Form-item>
        <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search"
          >搜索</Button
        >
        <Button @click="resetting" class="search-btn" type="info" icon="ios-refresh">重置</Button>
      </Form>
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
      >
        <!-- 商品栏目格式化 -->
        <template slot="goodsSlot" slot-scope="scope">
          <div style="margin-top: 5px; height: 80px; display: flex">
            <div style="">
              <img
                :src="scope.row.original"
                style="height: 60px; margin-top: 3px; width: 60px"
              />
            </div>

            <div style="margin-left: 13px">
              <div class="div-zoom">
                <span>{{ scope.row.goodsName }}</span>
              </div>
            </div>
          </div>
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
import { authGoods, getAuthGoodsListData } from "@/api/goods";
import RightToolbar from "@/components/RightToolbar/index.vue";
import Cookies from "js-cookie";
import {getTenantArea} from "@/api/tenant";

export default {
  name: "goods",
  components: {RightToolbar},
  data() {
    return {
      id: "", //要操作的id
      loading: true, // 表单加载状态
      showSearch: true,
      userInfo: JSON.parse(Cookies.get("userInfoManager")),
      tenantList:[],
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        order: "desc", // 默认排序方式
      },
      goodsAuditForm: {
        // 商品编辑表单
        auth_flag: 1,
      },
      columns: [
        {
          title: "商品名称",
          key: "goodsName",
          minWidth: 180,
          slot: "goodsSlot",
          tooltip: true,
        },
        {
          title: "商品编号",
          key: "id",
          minWidth: 100,
          tooltip: true,
        },
        {
          title: "价格",
          key: "price",
          minWidth: 130,
          render: (h, params) => {
            return h("div", this.$options.filters.unitPrice(params.row.price, "￥"));
          },
        },
        {
          title: "审核状态",
          key: "authFlag",
          minWidth: 130,
          render: (h, params) => {
            if (params.row.authFlag == "TOBEAUDITED") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "待审核",
                  },
                }),
              ]);
            } else if (params.row.authFlag == "PASS") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "审核通过",
                  },
                }),
              ]);
            } else if (params.row.authFlag == "REFUSE") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "error",
                    text: "审核拒绝",
                  },
                }),
              ]);
            }
          },
        },

        {
          title: "店铺名称",
          key: "storeName",
          minWidth: 100,
          tooltip: true,
        },
        {
          title: "所属租户",
          key: "name",
          width: 100,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 200,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.examine(params.row, 1);
                    },
                  },
                },
                "通过"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.examine(params.row, 2);
                    },
                  },
                },
                "拒绝"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  on: {
                    click: () => {
                      this.showDetail(params.row);
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
    init() {
      // 初始化数据
      this.getTenantList();
      this.getDataList();
    },
    // 获取租户列表
    getTenantList() {
      let params = {
        pageSize: 100
      }
      getTenantArea(params).then(res => {
        if (res.success) {
          this.tenantList = res.result.records;
        }
      });
    },
    changePage(v) {
      // 改变页码
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      // 改变每页数量
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      // 搜索
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    //重置搜索条件
    resetting(){
      this.$refs.searchForm.resetFields();
      this.handleSearch();
    },
    getDataList() {
      // 获取列表数据
      this.loading = false;
      // 带多条件搜索参数获取表单数据
      this.searchForm.authFlag = 0;
      getAuthGoodsListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.loading = true;
    },
    examine(v, authFlag) {
      // 审核商品
      let examine = "通过";
      this.goodsAuditForm.authFlag = "PASS";
      if (authFlag != 1) {
        examine = "拒绝";
        this.goodsAuditForm.authFlag = "REFUSE";
      }
      this.$Modal.confirm({
        title: "确认审核",
        content: "您确认要审核" + examine + " " + v.goodsName + " ?",
        loading: true,
        onOk: () => {
          authGoods(v.id, this.goodsAuditForm).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("审核成功");
              this.getDataList();
            }
          });
        },
      });
    },
    //查看商品详情
    showDetail(v) {
      let id = v.id;
      this.$router.push({
        name: "goods-detail",
        query: { id: id },
      });
    },
  },
  mounted() {
    if(!this.userInfo.isSuper&&this.userInfo.tenantId){
      this.searchForm.tenantId=this.userInfo.tenantId;
      this.columns = this.columns.filter(col => col.key !== 'name' );
    }
    this.init();
  },
};
</script>
