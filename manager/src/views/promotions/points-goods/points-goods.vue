<template>
  <div class="search">
    <Card>
      <Row>
        <Form
          ref="searchForm"
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
          <Form-item label="积分区间">
            <Input
              type="text"
              v-model="searchForm.pointsS"
              placeholder="请输入开始区间"
              clearable
              style="width: 200px"
            />
            -
            <Input
              type="text"
              v-model="searchForm.pointsE"
              placeholder="请输入结束区间"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="状态" prop="promotionStatus">
            <Select v-model="searchForm.promotionStatus" style="width: 200px">
              <Option v-for="item in statusList" :value="item.value" :key="item.value">{{
                item.label
              }}</Option>
            </Select>
          </Form-item>
          <Form-item label="SKU编码" prop="skuId">
            <Input
              type="text"
              v-model="searchForm.skuId"
              placeholder="请输入SKU编码"
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
          <Button
            @click="handleSearch"
            type="primary"
            icon="ios-search"
            class="search-btn"
            >搜索</Button
          >
          <Button @click="resetting" class="search-btn" type="info" icon="ios-refresh">重置</Button>
        </Form>
      </Row>
      <Row class="operation padding-row" >
        <Col span="22">
          <Button @click="addPointsGoods" type="primary" icon="md-add">添加积分商品</Button>
        </Col>
        <Col span="2">
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getDataList"></right-toolbar>
        </Col>
      </Row>

      <Table :loading="loading" border :columns="columns" :data="data" ref="table">
        <template slot-scope="{ row }" slot="goodsName">
          <div>
            <span class="mr_10">{{
              row.goodsName
            }}</span>
            <Poptip trigger="hover" title="扫码在手机中查看" transfer>
              <div slot="content">
                <vue-qr
                  :text="wapLinkTo(row.goodsId, row.skuId)"
                  :margin="0"
                  colorDark="#000"
                  colorLight="#fff"
                  :size="150"
                ></vue-qr>
              </div>
              <img
                src="../../../assets/qrcode.svg"
                style="vertical-align: middle"
                class="hover-pointer"
                width="20"
                height="20"
                alt=""
              />
            </Poptip>
          </div>
        </template>
        <template slot-scope="{ row }" slot="price">
          <div>{{ row.originalPrice | unitPrice("￥") }}</div>
        </template>
        <template slot-scope="{ row }" slot="settlementPrice">
          <div>{{ row.settlementPrice | unitPrice("￥") }}</div>
        </template>
        <template slot-scope="{ row }" slot="quantity">
          <div>{{ row.activeStock }}</div>
        </template>
        <template slot-scope="{ row }" slot="startTime">
          <div>{{ row.startTime }}</div>
          <div>{{ row.endTime }}</div>
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button
            v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
            type="info"
            size="small"
            @click="edit(row.id)"
            style="margin-right: 5px"
            >编辑</Button
          >
          <Button
            v-if="row.promotionStatus === 'START' || row.promotionStatus === 'NEW'"
            type="warning"
            size="small"
            @click="statusChanged(row.id, 'CLOSE')"
            style="margin-right: 5px"
            >关闭</Button
          >
          <Button
            v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'END'"
            type="error"
            size="small"
            @click="close(row.id)"
            style="margin-right: 5px"
            >删除</Button
          >
        </template>
      </Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="small"
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
  getPointsGoodsList,
  editPointsGoodsStatus,
  deletePointsGoodsStatus,
} from "@/api/promotion";
import vueQr from "vue-qr";
import { promotionsStatusRender } from "@/utils/promotions";
import RightToolbar from "@/components/RightToolbar/index.vue";
import Cookies from "js-cookie";
import {getTenantArea} from "@/api/tenant";

export default {
  name: "pointsGoods",
  components: {
    RightToolbar,
    "vue-qr": vueQr,
  },
  data() {
    return {
      loading: true, // 表单加载状态
      showSearch: true,
      userInfo: JSON.parse(Cookies.get("userInfoManager")),
      tenantList: [],
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        order: "desc", // 默认排序方式
        pointsS:"",
        pointsE:"",
      },
      statusList: [
        // 活动状态
        { label: "未开始", value: "NEW" },
        { label: "已开始", value: "START" },
        { label: "已结束", value: "END" },
        { label: "已关闭", value: "CLOSE" },
      ],
      columns: [
        // 表头
        {
          title: "商品名称",
          slot: "goodsName",
          minWidth: 150,
          fixed: "left",
          tooltip: true,
        },
        {
          title: "市场价",
          slot: "price",
          width: 100,
        },
        {
          title: "结算价",
          slot: "settlementPrice",
          width: 100,
        },
        {
          title: "库存数量",
          slot: "quantity",
          width: 100,
        },
        {
          title: "活动剩余库存",
          key: "activeStock",
          width: 150,
        },
        {
          title: "兑换积分",
          key: "points",
          width: 100,
        },
        {
          title: "所属店铺",
          key: "storeName",
          width: 100,
        },
        {
          title: "活动开始时间",
          slot: "startTime",
          minWidth: 150,
        },
        {
          title: "状态",
          key: "promotionStatus",
          width: 100,
          render: (h, params) => {
            return promotionsStatusRender(h, params);
          },
        },
        {
          title: "分类",
          key: "pointsGoodsCategoryName",
          width: 100,
        },
        {
          title: "所属租户",
          key: "name",
          width: 100,
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          fixed: "right",
          width: 150,
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
    // 跳转添加商品页面
    addPointsGoods() {
      this.$router.push({ name: "add-points-goods" });
    },
    // 分页 修改页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 修改页数
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      if (this.searchForm.pointsS) {
        this.searchForm.pointS =
          this.searchForm.pointsS +
          "_" +
          (this.searchForm.pointsE ? this.searchForm.pointsE : "");
      }
      this.getDataList();
    },
    //重置搜索条件
    resetting(){
      this.$refs.searchForm.resetFields();
      this.searchForm.pointsS="";
      this.searchForm.pointsE="";
      this.handleSearch();
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      getPointsGoodsList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    // 编辑
    edit(id) {
      this.$router.push({ name: "edit-points-goods", query: { id: id } });
    },
    // 启用 停用积分商品
    statusChanged(id, status, startTime, endTime) {
      let text = "";
      let params = {};
      if (status == "START") {
        text = "开启";
        params = {
          startTime: startTime,
          endTime: endTime,
        };
      } else if (status == "CLOSE") {
        text = "关闭";
      }
      this.$Modal.confirm({
        title: "确认" + text,
        content: "您确认要" + text + "此积分商品?",
        loading: true,
        onOk: () => {
          editPointsGoodsStatus(id, params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success(text + "成功");
              this.getDataList();
            }
          });
        },
      });
    },
    // 删除积分商品
    close(id) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除此积分商品?",
        loading: true,
        onOk: () => {
          // 删除
          deletePointsGoodsStatus(id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
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
