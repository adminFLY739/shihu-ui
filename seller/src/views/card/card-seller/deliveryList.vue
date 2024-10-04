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
          <Form-item label="提货码状态" prop="deliveryStatus">
            <Select
              v-model="searchForm.deliveryStatus"
              placeholder="请选择"
              clearable
              style="width: 200px"
            >
              <Option value="NOTISSUED">未领取</Option>
              <Option value="NOTUSE">未使用</Option>
              <Option value="RECEIVED">已使用</Option>
              <Option value="CLOSED">已关闭</Option>
              <Option value="OVERDUE">已过期</Option>
            </Select>
          </Form-item>
          <Button
            @click="handleSearch"
            type="primary"
            class="search-btn"
            icon="ios-search"
            >搜索</Button>
          <Button @click="handleReset" class="search-btn" icon="md-refresh">重置</Button>
        </Form>
      </Row>
      <Row class="operation padding-row" >
        <Col span="22">
          <Button @click="add" type="primary" icon="md-add">添加</Button>
          <Button @click="delAll" class="ml_10" icon="md-power">批量关闭</Button>
          <Button @click="getAll" class="ml_10" icon="md-power">批量领取</Button>
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
        <template slot-scope="{ row }" slot="action">
          <Button type="default" size="small" @click="see(row)"
            >查看二维码</Button
          >
          <Button
            v-if="
              row.deliveryStatus === 'NOTISSUED'
            "
            type="error"
            size="small"
            :style="{ marginLeft: '5px' }"
            @click="remove(row)"
            >关闭</Button
          >
          <Button
            style="margin: 5px"
            type="info"
            size="small"
            @click="get(row)"
            v-if="
              row.deliveryStatus === 'NOTISSUED'
            "
            >领取
          </Button>
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
      title="添加提货码"
      v-model="addDelivery"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="form" :model="addForm" :label-width="120"  :rules="addFormRule">
        <FormItem label="卡券" prop="cardId">
          <Select
            v-model="addForm.cardId"
            filterable
            style="width: 200px"
          >
            <Option
              v-for="item in cardList"
              :key="item.id"
              :label="item.cardName"
              :value="item.id"
            ></Option>
          </Select>
        </FormItem>

        <FormItem label="发放数量"  prop="publishNum">
          <Input
            v-model="addForm.publishNum"
            placeholder="发放数量"
            style="width: 200px"
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="addDelivery = false">取消</Button>
        <Button type="primary" @click="addDeliverys()">添加</Button>
      </div>
    </Modal>

    <Modal
      title="查看二维码"
      v-model="showQRcode"
      :mask-closable="false"
      :width="500"
    >
      <div class="QRcode">
        <!-- <vueQr>123</vueQr> -->
        <vue-qr
          :text="wapLinkToDelivery(QRcodeDelivery.deliveryCode, QRcodeDelivery.deliveryPassword)"
          :margin="0"
          colorDark="#000"
          colorLight="#fff"
          :size="150"
        ></vue-qr>
        <div>
          <div style="margin-top: 30px">
            提货号码:{{QRcodeDelivery.deliveryCode}}
          </div>

          <div style="margin-top: 20px">
            提货密码:{{QRcodeDelivery.deliveryPassword}}
          </div>
        </div>
      </div>

    </Modal>


  </div>
</template>

<script>

import {
  deliveryStatusRender,
} from "@/utils/promotions";
import RightToolbar from "@/components/RightToolbar/index.vue";
import {addDelivery, getDeliveryList, getStoreAllCardList, updateDeliveryStatus} from "@/api/card";
import {regular} from "@/utils";


export default {
  name: "coupon",
  components: {RightToolbar},
  data() {
    return {
      selectDate: [],
      loading: true, // 表单加载状态
      showSearch: true,
      addDelivery:false,
      cardList:[],
      showQRcode:false,
      QRcodeDelivery:{},
      addForm:{
        cardId:"",
        publishNum:"",
      },
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
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
          minWidth: 260,
          tooltip: true,
        },
        {
          title: "提货码",
          key: "deliveryCode",
          width: 300,
        },
        {
          title: "提货密码",
          key: "deliveryPassword",
          width: 150,
        },

        {
          title: "状态",
          width: 130,
          key: "deliveryStatus",
          fixed: "right",
          render: (h, params) => {
            return deliveryStatusRender(h, params);
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

      addFormRule: {
        cardId: [{ required: true, message: "卡券选择不能为空" }],
        publishNum: [
          { required: true, message: "请输入发放数量" },
          { pattern: regular.integer, message: "请输入正整数" },
        ],
      },
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
      this.GET_Card();
      this.addDelivery=true;
    },
    info(v) {
      this.$router.push({ name: "platform-coupon-info", query: { id: v.id } });
    },

    //添加提货码
    addDeliverys() {
      this.$refs.form.validate((valid) => {
          if (valid) {
            addDelivery(this.addForm).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("添加提货码成功");
                this.addDelivery=false;
                this.getDataList();
              }
            });
          }
      });
    },

    // 获取卡券
    GET_Card() {
      getStoreAllCardList().then((res) => {
        if (res.success) {
          this.cardList=res.result;
        }
      });
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
      getDeliveryList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = true;
    },
    // 查看二维码
    see(v) {
       this.QRcodeDelivery = v;
       this.showQRcode=true;
    },
    // 下架优惠券
    remove(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "确认要关闭此提货码么?",
        loading: true,
        onOk: () => {
          this.loading = false;
          let params = {
            deliveryIds: v.id,
            status:"CLOSED",
          };
          updateDeliveryStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("关闭成功");
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
            deliveryIds: ids.toString(),
            status:"CLOSED",
          };
          updateDeliveryStatus(params).then((res) => {
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

    // 批量领取
    getAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要领取的优惠券");
        return;
      }
      this.$Modal.confirm({
        title: "确认领取",
        content: "您确认要领取所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });

          let params = {
            deliveryIds: ids.toString(),
            status:"NOTUSE",
          };
          updateDeliveryStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("领取成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
    // 下架优惠券
    get(v) {
      this.$Modal.confirm({
        title: "确认领取",
        content: "确认要领取此提货码么?",
        loading: true,
        onOk: () => {
          this.loading = false;
          let params = {
            deliveryIds: v.id,
            status:"NOTUSE",
          };
          updateDeliveryStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("领取成功");
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
.QRcode{
  display: flex;
  justify-content: space-between;
  margin-right: 10px;
  font-size: 18px;
  font-weight: bold;
}
</style>
