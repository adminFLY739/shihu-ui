<template>
  <div class="search">
    <Card>
      <Row style="background:#eee;padding:10px; margin-bottom: 10px" v-show="showData">
        <Col span="6" offset="1">
          <Card :bordered="false">
            <p slot="title">总商品数</p>
            <p>{{goodsData.goodsNum}}</p>
          </Card>
        </Col>
        <Col span="6" offset="2">
          <Card shadow>
            <p slot="title">未上架商品数</p>
            <p>{{goodsData.goodsUpper}}</p>
          </Card>
        </Col>
        <Col span="6" offset="2">
          <Card shadow>
            <p slot="title">未审核商品数</p>
            <p>{{goodsData.goodsAudit}}</p>
          </Card>
        </Col>
      </Row>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
        @keydown.enter.native="handleSearch"
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
        <Form-item label="店铺名称" prop="storeName">
          <Input
            type="text"
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="状态" prop="status">
          <Select
            v-model="searchForm.marketEnable"
            placeholder="请选择"
            clearable
            style="width: 200px"
          >
            <Option value="UPPER">上架</Option>
            <Option value="DOWN">下架</Option>
          </Select>
        </Form-item>
        <Form-item label="销售模式" prop="status">
          <Select
            v-model="searchForm.salesModel"
            placeholder="请选择"
            clearable
            style="width: 200px"
          >
            <Option value="RETAIL">零售</Option>
            <Option value="WHOLESALE">批发</Option>
          </Select>
        </Form-item>
        <Form-item label="商品类型" prop="status">
          <Select
            v-model="searchForm.goodsType"
            placeholder="请选择"
            clearable
            style="width: 200px"
          >
            <Option value="PHYSICAL_GOODS">实物商品</Option>
            <Option value="VIRTUAL_GOODS">虚拟商品</Option>
          </Select>
        </Form-item>
        <Form-item label="审核状态" prop="status">
          <Select
            v-model="searchForm.authFlag"
            placeholder="请选择"
            clearable
            style="width: 200px"
          >
            <Option value="TOBEAUDITED">待审核</Option>
            <Option value="PASS">审核通过</Option>
            <Option value="REFUSE">审核拒绝</Option>
          </Select>
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
        <Button
          @click="handleSearch"
          class="search-btn"
          type="primary"
          icon="ios-search"
          >搜索</Button
        >
        <Button @click="resetting" class="search-btn" type="info" icon="ios-refresh">重置</Button>
      </Form>
      <Row class="operation padding-row" >
        <Col span="22">
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
        class="mt_10"
      >
        <!-- 商品栏目格式化 -->
        <template slot="goodsSlot" slot-scope="{ row }">
          <div style="margin: 5px 0px; height: 80px; display: flex">
            <div style="">
              <img
                :src="row.original"
                style="height: 60px; margin-top: 1px; width: 60px"
              />
            </div>

            <div style="margin-left: 13px">
              <div class="div-zoom">
                <span >{{ row.goodsName }}</span>
              </div>
              <Poptip trigger="hover" title="扫码在手机中查看" transfer>
                <div slot="content">
                  <vue-qr
                    :text="wapLinkTo(row.id, row.skuId)"
                    :margin="0"
                    colorDark="#000"
                    colorLight="#fff"
                    :size="150"
                  ></vue-qr>
                </div>
                <img
                  src="../../../assets/qrcode.svg"
                  class="hover-pointer"
                  width="20"
                  height="20"
                  alt=""
                />
              </Poptip>
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
    <Modal
      title="下架操作"
      v-model="modalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="underForm" :model="underForm" :label-width="100">
        <FormItem label="下架原因" prop="reason">
          <Input v-model="underForm.reason" clearable style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="lower"
          >提交</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import { getGoodsListData, upGoods, lowGoods,getGoodsData } from "@/api/goods";
import vueQr from "vue-qr";
import RightToolbar from "@/components/RightToolbar/index.vue";
import Cookies from "js-cookie";
import {getTenantArea} from "@/api/tenant";
import {getOrderData} from "@/api/order";
export default {
  components: {
    RightToolbar,
    "vue-qr": vueQr,
  },
  name: "goods",
  data() {
    return {
      id: "", //要操作的id
      loading: true, // 表单加载状态
      modalVisible: false, // 添加或编辑显示
      showSearch: true,
      showData:true,
      tenantList:[],
      goodsData:{},
      userInfo: JSON.parse(Cookies.get("userInfoManager")),
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        order: "desc", // 默认排序方式
        goodsName:"",
        id:"",
        storeName:"",
        marketEnable:"",
      },
      underForm: {
        // 下架原因
        reason: "",
      },
      submitLoading: false, // 添加或编辑提交状态
      columns: [
        {
          title: "商品名称",
          key: "goodsName",
          minWidth: 180,
          slot: "goodsSlot",
        },
        {
          title: "商品编号",
          key: "id",
          minWidth: 150,
          tooltip: true,
        },
        {
          title: "价格",
          key: "price",
          width: 130,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.price, "￥")
            );
          },
        },
        {
          title: "销售模式",
          key: "salesModel",
          width: 100,
          render: (h, params) => {
            if (params.row.salesModel === "RETAIL") {
              return h("Tag", { props: { color: "orange" } }, "零售");
            } else if (params.row.salesModel === "WHOLESALE") {
              return h("Tag", { props: { color: "magenta" } }, "批发");
            } else {
              return h("Tag", { props: { color: "volcano" } }, "其他类型");
            }
          },
        },
        {
          title: "商品类型",
          key: "goodsType",
          width: 130,
          render: (h, params) => {
            if (params.row.goodsType === "PHYSICAL_GOODS") {
              return h("Tag", { props: { color: "green" } }, "实物商品");
            } else if (params.row.goodsType === "VIRTUAL_GOODS") {
              return h("Tag", { props: { color: "volcano" } }, "虚拟商品");
            } else {
              return h("Tag", { props: { color: "geekblue" } }, "电子卡券");
            }
          },
        },
        {
          title: "状态",
          key: "marketEnable",
          width: 100,
          render: (h, params) => {
            if (params.row.marketEnable == "DOWN") {
              return h("Tag", { props: { color: "volcano" } }, "下架");
            } else if (params.row.marketEnable == "UPPER") {
              return h("Tag", { props: { color: "green" } }, "上架");
            }
          },
        },
        {
          title: "审核状态",
          key: "authFlag",
          width: 130,
          render: (h, params) => {
            if (params.row.authFlag == "TOBEAUDITED") {
              return h("Tag", { props: { color: "volcano" } }, "待审核");
            } else if (params.row.authFlag == "PASS") {
              return h("Tag", { props: { color: "green" } }, "通过");
            } else if (params.row.authFlag == "REFUSE") {
              return h("Tag", { props: { color: "red" } }, "拒绝");
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
          width: 150,
          render: (h, params) => {
            if (params.row.marketEnable == "DOWN") {
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
                        this.upper(params.row);
                      },
                    },
                  },
                  "上架"
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
            } else {
              return h("div", [
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
                        this.edit(params.row);
                      },
                    },
                  },
                  "下架"
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
            }
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
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize(v) {
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
      this.searchForm.goodsType="";
      this.searchForm.salesModel="";
      this.searchForm.marketEnable="";
      this.handleSearch();
    },
    // 获取数据
    getDataList() {
      this.loading = false;
      getGoodsListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.loading = true;
    },
    // 编辑
    edit(v) {
      this.id = v.id;
      if (v.underMessage) {
        this.underForm.reason = v.underMessage;
      } else {
        this.underForm.reason = "";
      }
      this.modalVisible = true;
    },
    // 下架
    lower() {
      lowGoods(this.id, this.underForm).then((res) => {
        this.$Modal.remove();
        if (res.success) {
          this.$Message.success("操作成功");
          this.modalVisible = false;
          this.getDataList();
        }
      });
    },
    // 商家
    upper(v) {
      this.$Modal.confirm({
        title: "确认上架",
        content: "您确认要上架 " + v.goodsName + " ?",
        loading: true,
        onOk: () => {
          upGoods(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("上架成功");
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

    //商品统计数据
    async getGoodsDatas() {
      let res = await getGoodsData({tenantId: this.userInfo.tenantId});
      if (res.success) {
        this.goodsData = res.result;
      }
    },
  },
  mounted() {
    if(!this.userInfo.isSuper&&this.userInfo.tenantId){
      this.searchForm.tenantId=this.userInfo.tenantId;
      this.columns = this.columns.filter(col => col.key !== 'name' );
    }
    this.getGoodsDatas();
    this.init();
  },
};
</script>
