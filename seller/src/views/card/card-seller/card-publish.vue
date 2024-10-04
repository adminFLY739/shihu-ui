<template>
  <div class="wrapper">
    <Card>
      <Form ref="form" :model="form" :label-width="120" :rules="formRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <FormItem label="活动名称" prop="promotionName">
              <Input
                :disabled="disabled"
                type="text"
                v-model="form.promotionName"
                placeholder="活动名称"
                clearable
                style="width: 260px"
              />
            </FormItem>
            <FormItem label="卡券名称" prop="cardName">
              <Input
                :disabled="disabled"
                type="text"
                v-model="form.cardName"
                placeholder="卡券名称"
                clearable
                style="width: 260px"
              />
            </FormItem>

            <FormItem label="卡券图片"  prop="image">
                <upload-pic-thumb
                  v-model="form.image"
                  :multiple="false"
                ></upload-pic-thumb>
            </FormItem>
            <FormItem label="价格" prop="price">
              <Input
                :disabled="disabled"
                type="text"
                v-model="form.price"
                placeholder="价格"
                clearable
                style="width: 260px"
              />
            </FormItem>

            <FormItem label="发放数量"  prop="publishNum" >
              <Input
                :disabled="disabled||id"
                v-model="form.publishNum"
                placeholder="发放数量"
                style="width: 260px"
              />
              <span class="describe" v-if="id">若要修改发放数量，前往提货码处添加提货码修改</span>
            </FormItem>
          </div>
          <h4>使用限制</h4>
          <div class="form-item-view">
            <FormItem label="有效期" prop="rangeTime">
              <DatePicker
                :disabled="disabled"
                type="datetimerange"
                v-model="form.rangeTime"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择"
                :options="options"
                style="width: 260px"
              >
              </DatePicker>
            </FormItem>

            <FormItem style="width: 100%">
              <div style="display: flex; margin-bottom: 10px">
                <Button :disabled="disabled" type="primary" @click="openSkuList"
                  >选择商品</Button
                >
                <Button
                  :disabled="disabled"
                  type="error"
                  ghost
                  style="margin-left: 10px"
                  @click="delSelectGoods"
                  >批量删除</Button
                >
              </div>
              <Table
                class="mt_10"
                :disabled="disabled"
                border
                :columns="columns"
                :data="form.cardGoodsList"
                @on-selection-change="changeSelect"
              >
                <template slot-scope="{ row }" slot="QRCode">
                  <img
                    :src="row.QRCode || '../../../assets/lili.png'"
                    width="50px"
                    height="50px"
                    alt=""
                  />
                </template>
              </Table>
            </FormItem>



            <FormItem label="范围描述" prop="description">
              <Input
                :disabled="disabled"
                v-model="form.description"
                type="textarea"
                :rows="4"
                maxlength="50"
                show-word-limit
                clearable
                style="width: 260px"
              />
            </FormItem>
            <div>
              <Button
                :disabled="disabled"
                type="text"
                @click="$router.push({ name: 'coupon' })"
                >返回</Button
              >
              <Button
                :disabled="disabled"
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit"
                >提交</Button
              >
            </div>
          </div>
        </div>
      </Form>
    </Card>
    <sku-select ref="skuSelect" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script>
import { getGoodsCategoryAll } from "@/api/goods";
import { regular } from "@/utils";
import skuSelect from "@/views/lili-dialog";
import {addCard, editCard, getCard} from "@/api/card";
import UploadPicThumb from "@/views/my-components/lili/upload-pic-thumb.vue";
export default {
  name: "addCoupon",
  components: {
    UploadPicThumb,
    skuSelect,
  },
  data() {
    const checkPrice = (rule, value, callback) => {
      if (!value && value !== 0) {
        return callback(new Error("面额不能为空"));
      } else if (!regular.money.test(value)) {
        callback(new Error("请输入正整数或者两位小数"));
      } else if (parseFloat(value) > 99999999) {
        callback(new Error("面额设置超过上限值"));
      } else {
        callback();
      }
    };
    return {
      modalType: 0, // 判断是新增还是编辑优惠券 0 新增  1 编辑
      disabled: this.$route.query.onlyView,
      form: {
        /** 发行数量 */
        publishNum: 1,
        /** 优惠券名称 */
        couponName: "",
        cardGoodsList: [],
        scopeIdGoods: [],
      },
      id: this.$route.query.id,
      submitLoading: false, // 添加或编辑提交状态
      selectedGoods: [], // 已选商品列表，便于删除
      goodsCategoryList: [], // 商品分类列表
      formRule: {
        promotionName: [{ required: true, message: "活动名称不能为空" }],
        cardName: [{ required: true, message: "卡券名称不能为空" }],
        image: [{ required: true, message: "请上传图片" }],
        price: [{ required: true, message: "请输入面额" }, { validator: checkPrice }],
        rangeTime: [{ required: true, message: "请选择优惠券有效期" }],

        description: [{ required: true, message: "请输入范围描述" }],
        publishNum: [
          { required: true, message: "请输入发放数量" },
          { pattern: regular.integer, message: "请输入正整数" },
        ],
      },
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "商品名称",
          key: "goodsName",
          minWidth: 120,
        },
        {
          title: "商品价格",
          key: "price",
          minWidth: 40,
          render: (h, params) => {
            return h("div", this.$options.filters.unitPrice(params.row.price, "￥"));
          },
        },
        {
          title: "库存",
          key: "quantity",
          minWidth: 40,
        },

        {
          title: "操作",
          key: "action",
          minWidth: 50,
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  size: "small",
                  type: "error",
                  ghost: true,
                },
                on: {
                  click: () => {
                    this.delGoods(params.index);
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
      // 时间选择器可选范围
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
    };
  },
  async mounted() {
    await this.getCagetoryList();
    // 如果id不为空则查询信息
    if (this.id) {
      this.getCoupon();
      this.modalType = 1;
    }
  },
  methods: {
    // 获取回显数据
    getCoupon() {
       getCard(this.id).then((res) => {
        let data = res.result;
        if (!data.cardGoodsList) data.cardGoodsList = [];

        data.rangeTime = [];
        if (data.startTime && data.endTime) {
          data.rangeTime.push(new Date(data.startTime), new Date(data.endTime));
        }
        this.form = data;
      });
    },
    /** 保存卡券券 */
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form));
          params.startTime = this.$options.filters.unixToDate(
            this.form.rangeTime[0] / 1000
          );
          params.endTime = this.$options.filters.unixToDate(
            this.form.rangeTime[1] / 1000
          );
          delete params.rangeTime;
          let scopeId = [];
          if (!params.cardGoodsList || params.cardGoodsList.length === 0)
          {
            this.$Modal.warning({ title: "提示", content: "请选择指定商品" });
            return;
          }

          //指定商品
          params.cardGoodsList.forEach((item) => {
            scopeId.push(item.skuId);
          });
          params.scopeId = scopeId.toString();

          delete params.scopeIdGoods;

          this.submitLoading = true;
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete params.id;
            addCard(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("卡券添加成功");
                this.closeCurrentPage();
              }
            });
          } else {
            // 编辑
            delete params.consumeLimit;
            delete params.updateTime;

            editCard(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("优惠券修改成功");
                this.closeCurrentPage();
              }
            });
          }
        }
      });
    },
    // 关闭当前页面
    closeCurrentPage() {
      this.$store.commit("removeTag", "add-card");
      localStorage.storeOpenedList = JSON.stringify(
        this.$store.state.app.storeOpenedList
      );
      this.$router.push({
        name: "cardList",
      });
    },
    openSkuList() {
      // 显示商品选择器
      this.$refs.skuSelect.open("goods");
      let data = JSON.parse(JSON.stringify(this.form.cardGoodsList));
      data.forEach((e) => {
        e.id = e.skuId;
      });
      this.$refs.skuSelect.goodsData = data;
    },
    changeSelect(e) {
      // 已选商品批量选择
      this.selectedGoods = e;
    },
    delSelectGoods() {
      // 多选删除商品
      if (this.selectedGoods.length <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选商品吗?",
        onOk: () => {
          let ids = [];
          this.selectedGoods.forEach(function (e) {
            ids.push(e.id);
          });
          this.form.cardGoodsList = this.form.cardGoodsList.filter((item) => {
            return !ids.includes(item.id);
          });
        },
      });
    },
    delGoods(index) {
      // 删除商品
      this.form.cardGoodsList.splice(index, 1);
    },
    selectedGoodsData(item) {
      // 回显已选商品
      let list = [];
      item.forEach((e) => {
        list.push({
          goodsName: e.goodsName,
          price: e.price,
          originalPrice: e.price,
          quantity: e.quantity,
          storeId: e.storeId,
          sellerName: e.sellerName,
          thumbnail: e.thumbnail,
          skuId: e.id,
          categoryPath: e.categoryPath,
          goodsId: e.goodsId,
          goodsType: e.goodsType,
        });
      });
      this.form.cardGoodsList = list;
    },
    getGoodsCategory(e) {
      // 获取级联选择器商品分类id
    },

    async getCagetoryList() {
      // 获取全部商品分类
      let data = await getGoodsCategoryAll();
      this.goodsCategoryList = this.filterCategory(data.result);
      // 过滤出可显示的值

      this.goodsCategoryList = this.goodsCategoryList.map((item) => {
        if (item.children) {
          item.children = item.children.map((child) => {
            if (child.children) {
              child.children = child.children.map((son) => {
                return {
                  value: son.id,
                  label: son.name,
                };
              });
              return {
                value: child.id,
                label: child.name,
                children: child.children,
              };
            } else {
              return {
                value: child.id,
                label: child.name,
              };
            }
          });
        }
        return { value: item.id, label: item.name, children: item.children };
      });
    },
    filterCategory(list) {
      // 递归删除空children
      list.forEach((item) => {
        if (item.children.length == 0) {
          delete item.children;
        } else {
          this.filterCategory(item.children);
        }
      });
      return list;
    },
    filterCategoryId(list, idArr) {
      // 递归获取分类id
      list.forEach((e) => {
        if (e instanceof Array) {
          this.filterCategoryId(e, idArr);
        } else {
          if (!idArr.includes(e)) idArr.push(e);
        }
      });
      return idArr;
    },
  },
};
</script>

<style lang="scss" scpoed>
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
}
.describe {
  font-size: 12px;
  margin-left: 10px;
  color: #999;
}
.ivu-form-item {
  margin-bottom: 24px !important;
}
.wrapper {
  min-height: 1000px;
}
.tips {
  font-size: 12px;
  color: #999;
}
</style>
