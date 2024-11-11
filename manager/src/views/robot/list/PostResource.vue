<!--<template>-->
<!--  <div class="search">-->
<!--    <Card>-->
<!--      <Table-->
<!--        :loading="loading"-->
<!--        border-->
<!--        :columns="columns"-->
<!--        :data="data"-->
<!--        ref="table"-->
<!--        class="mt_10"-->
<!--      >-->
<!--        <template slot="goodsSlot" slot-scope="{ row }">-->
<!--          <div style="margin: 5px 0px; height: 80px; display: flex">-->
<!--            <div style="">-->
<!--              <img-->
<!--                :src="row.original"-->
<!--                style="height: 60px; margin-top: 1px; width: 60px"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->
<!--        </template>-->
<!--      </Table>-->
<!--      <Row type="flex" justify="center" class="mt_10">-->
<!--        <Page-->
<!--          :current="searchForm.pageNumber"-->
<!--          :total="total"-->
<!--          :page-size="searchForm.pageSize"-->
<!--          @on-change="changePage"-->
<!--          @on-page-size-change="changePageSize"-->
<!--          :page-size-opts="[10, 20, 50]"-->
<!--          size="default"-->
<!--          show-total-->
<!--          show-elevator-->
<!--          show-sizer-->
<!--        ></Page>-->
<!--      </Row>-->
<!--    </Card>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { getGoodsListData, upGoods, lowGoods,getGoodsData } from "@/api/goods";-->
<!--import vueQr from "vue-qr";-->
<!--import RightToolbar from "@/components/RightToolbar/index.vue";-->
<!--import Cookies from "js-cookie";-->
<!--import {getTenantArea} from "@/api/tenant";-->
<!--import {getOrderData} from "@/api/order";-->
<!--export default {-->
<!--  components: {-->
<!--    RightToolbar,-->
<!--    "vue-qr": vueQr,-->
<!--  },-->
<!--  name: "goods",-->
<!--  data() {-->
<!--    return {-->
<!--      id: "", //要操作的id-->
<!--      loading: true, // 表单加载状态-->
<!--      modalVisible: false, // 添加或编辑显示-->
<!--      showSearch: true,-->
<!--      showData:true,-->
<!--      tenantList:[],-->
<!--      goodsData:{},-->
<!--      userInfo: JSON.parse(Cookies.get("userInfoManager")),-->
<!--      searchForm: {-->
<!--        // 搜索框初始化对象-->
<!--        pageNumber: 1, // 当前页数-->
<!--        pageSize: 10, // 页面大小-->
<!--        order: "desc", // 默认排序方式-->
<!--        goodsName:"",-->
<!--        id:"",-->
<!--        storeName:"",-->
<!--        marketEnable:"",-->
<!--      },-->
<!--      underForm: {-->
<!--        // 下架原因-->
<!--        reason: "",-->
<!--      },-->
<!--      submitLoading: false, // 添加或编辑提交状态-->
<!--      columns: [-->
<!--        {-->
<!--          title: "帖子图片",-->
<!--          key: "goodsName",-->
<!--          minWidth: 150,-->
<!--          slot: "goodsSlot",-->
<!--        },-->
<!--        {-->
<!--          title: "帖子标题",-->
<!--          key: "id",-->
<!--          minWidth: 150,-->
<!--          tooltip: true,-->
<!--        },-->
<!--        {-->
<!--          title: "帖子内容",-->
<!--          key: "price",-->
<!--          width: 150,-->
<!--        },-->
<!--        {-->
<!--          title: "帖子作者",-->
<!--          key: "storeName",-->
<!--          minWidth: 150,-->
<!--          tooltip: true,-->
<!--        },-->
<!--        {-->
<!--          title: "操作",-->
<!--          key: "action",-->
<!--          align: "center",-->
<!--          fixed: "right",-->
<!--          width: 150,-->
<!--          render: (h, params) => {-->
<!--            return h("div", [-->
<!--                h(-->
<!--                  "Button",-->
<!--                  {-->
<!--                    props: {-->
<!--                      type: "error",-->
<!--                      size: "small",-->
<!--                    },-->
<!--                    style: {-->
<!--                      marginRight: "5px",-->
<!--                    },-->
<!--                    on: {-->
<!--                      click: () => {-->
<!--                        this.upper(params.row);-->
<!--                      },-->
<!--                    },-->
<!--                  },-->
<!--                  "删除"-->
<!--                ),-->
<!--          ]);-->
<!--          },-->
<!--        },-->
<!--      ],-->
<!--      data: [], // 表单数据-->
<!--      total: 0, // 表单数据总数-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    // 初始化数据-->
<!--    init() {-->
<!--      this.getTenantList();-->
<!--      this.getDataList();-->
<!--    },-->

<!--    // 获取租户列表-->
<!--    getTenantList() {-->
<!--      let params = {-->
<!--        pageSize: 100-->
<!--      }-->
<!--      getTenantArea(params).then(res => {-->
<!--        if (res.success) {-->
<!--          this.tenantList = res.result.records;-->
<!--        }-->
<!--      });-->
<!--    },-->
<!--    // 分页 改变页码-->
<!--    changePage(v) {-->
<!--      this.searchForm.pageNumber = v;-->
<!--      this.getDataList();-->
<!--    },-->
<!--    // 分页 改变页数-->
<!--    changePageSize(v) {-->
<!--      this.searchForm.pageSize = v;-->
<!--      this.getDataList();-->
<!--    },-->
<!--    // 搜索-->
<!--    handleSearch() {-->
<!--      this.searchForm.pageNumber = 1;-->
<!--      this.searchForm.pageSize = 10;-->
<!--      this.getDataList();-->
<!--    },-->
<!--    //重置搜索条件-->
<!--    resetting(){-->
<!--      this.$refs.searchForm.resetFields();-->
<!--      this.searchForm.goodsType="";-->
<!--      this.searchForm.salesModel="";-->
<!--      this.searchForm.marketEnable="";-->
<!--      this.handleSearch();-->
<!--    },-->
<!--    // 获取数据-->
<!--    getDataList() {-->
<!--      this.loading = false;-->
<!--      getGoodsListData(this.searchForm).then((res) => {-->
<!--        this.loading = false;-->
<!--        if (res.success) {-->
<!--          this.data = res.result.records;-->
<!--          this.total = res.result.total;-->
<!--        }-->
<!--      });-->
<!--      this.loading = true;-->
<!--    },-->
<!--    // 编辑-->
<!--    edit(v) {-->
<!--      this.id = v.id;-->
<!--      if (v.underMessage) {-->
<!--        this.underForm.reason = v.underMessage;-->
<!--      } else {-->
<!--        this.underForm.reason = "";-->
<!--      }-->
<!--      this.modalVisible = true;-->
<!--    },-->
<!--    // 下架-->
<!--    lower() {-->
<!--      lowGoods(this.id, this.underForm).then((res) => {-->
<!--        this.$Modal.remove();-->
<!--        if (res.success) {-->
<!--          this.$Message.success("操作成功");-->
<!--          this.modalVisible = false;-->
<!--          this.getDataList();-->
<!--        }-->
<!--      });-->
<!--    },-->
<!--    // 商家-->
<!--    upper(v) {-->
<!--      this.$Modal.confirm({-->
<!--        title: "确认上架",-->
<!--        content: "您确认要上架 " + v.goodsName + " ?",-->
<!--        loading: true,-->
<!--        onOk: () => {-->
<!--          upGoods(v.id).then((res) => {-->
<!--            this.$Modal.remove();-->
<!--            if (res.success) {-->
<!--              this.$Message.success("上架成功");-->
<!--              this.getDataList();-->
<!--            }-->
<!--          });-->
<!--        },-->
<!--      });-->
<!--    },-->

<!--    //查看商品详情-->
<!--    showDetail(v) {-->
<!--      let id = v.id;-->
<!--      this.$router.push({-->
<!--        name: "goods-detail",-->
<!--        query: { id: id },-->
<!--      });-->
<!--    },-->

<!--    //商品统计数据-->
<!--    async getGoodsDatas() {-->
<!--      let res = await getGoodsData({tenantId: this.userInfo.tenantId});-->
<!--      if (res.success) {-->
<!--        this.goodsData = res.result;-->
<!--      }-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    if(!this.userInfo.isSuper&&this.userInfo.tenantId){-->
<!--      this.searchForm.tenantId=this.userInfo.tenantId;-->
<!--      this.columns = this.columns.filter(col => col.key !== 'name' );-->
<!--    }-->
<!--    this.getGoodsDatas();-->
<!--    this.init();-->
<!--  },-->
<!--};-->
<!--</script>-->
