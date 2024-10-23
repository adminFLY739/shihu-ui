<template>
  <div>
    <Card style="height: 240px;padding: 12px 12px 0px">
      <div class="head-title">基本信息</div>
      <div class="detail-body">
        <div class="ant-col-md-6">
          <div class="info">
            <div class="head-info">
              <Avatar size="large" :src="memberInfo.face"/>
              <div>
                <div class="name" v-if="memberInfo.nickName">
                  {{memberInfo.nickName}}
                </div>
                <div class="name" v-else>
                  {{memberInfo.username}}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ant-col-md-6">
          <p class="item">
            <span class="label">昵称：</span>
            <span class="info">{{memberInfo.nickName}}</span>
          </p>
          <p class="item">
            <span class="label">序列：</span>
            <span class="info">{{memberInfo.username}}</span>
          </p>
        </div>
      </div>
    </Card>

    <Card class="mt_10">
      <Tabs value="point" @on-click="robotOperationChange">
        <TabPane label="发想法" name="point">
          <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
            <FormItem label="标题" prop="name">
              <Input v-model="formValidate.name" placeholder="标题"></Input>
            </FormItem>
            <FormItem label="内容" prop="desc">
              <Input v-model="formValidate.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="说些什么叭...(不超过400字)"></Input>
            </FormItem>
            <FormItem label="图片" prop="media">

            </FormItem>
            <FormItem label="分类" prop="interest">
              <CheckboxGroup v-model="formValidate.interest">
                <Checkbox label="仓前"></Checkbox>
                <Checkbox label="下沙"></Checkbox>
                <Checkbox label="玉皇山"></Checkbox>
                <Checkbox label="开发"></Checkbox>
              </CheckboxGroup>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="handleSubmit('formValidate')">Submit</Button>
              <Button @click="handleReset('formValidate')" style="margin-left: 8px">Reset</Button>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="发话题" name="order" style="min-height: 200px">
        </TabPane>
        <TabPane label="点赞&收藏" name="address">
        </TabPane>
        <TabPane label="发回复" name="wallet">
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
import region from "@/components/region";
import * as API_Member from "@/api/member.js";
import * as API_Robot from "@/api/robot.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from '@/libs/RegExp.js';
import * as API_Order from "@/api/order.js";

export default {
  name: "robotDetail",
  components: {
    region,
    ossManage
  },
  data() {
    return {
      memberInfo: {},
      // 机器人基本信息
      formValidate: {
        name: '',
        interest: [],
        media: [],
        desc: ''
      },
      ruleValidate: {
        name: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        interest: [
          { required: true, type: 'array', min: 1, message: '请选择分类', trigger: 'change' },
          { type: 'array', trigger: 'change' }
        ],
        desc: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { type: 'string', min: 20, message: 'Introduce no less than 20 words', trigger: 'blur' }
        ]
      },
      id: "",//会员id
      loading: true, // 表单加载状态

      memberWalletInfo: {},//会员预存款信息
      addressModalTitle: "",//会员地址操作标题
      addressModalVisible: false, //会员地址操作弹出框
      addressForm: {
        id: "",
        isDefault: "0"

      },//会员地址操作form
      selectDate: null, // 选择时间段
      submitLoading: false, // 添加或编辑提交状态
      addressFormValidate: {
        name: [{required: true, message: "收货人姓名不能为空"}],
        mobile: [
          {required: true, message: '请输入收货人手机号码'},
          {
            pattern: RegExp.mobile,
            message: '请输入正确的手机号'
          }
        ],
        consigneeAddressPath: [{required: true, message: "收货人地址不能为空"}],
        detail: [{required: true, message: "收货人详细地址不能为空"}],
        alias: [{required: true, message: "收货人地址别名不能为空"}],
      },//会员地址操作表单校验
      //历史积分表格
      pointsColumns: [
        {
          title: "操作内容",
          key: "content",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "操作时间",
          key: "createTime",
          width: 200
        },
        {
          title: "之前积分",
          key: "beforePoint",
          width: 150,
        },
        {
          title: "变动积分",
          key: "variablePoint",
          width: 150,
          render: (h, params) => {
            if (params.row.pointType == 'INCREASE') {
              return h('div', [
                h('span', {
                  style: {
                    color: 'green'
                  }
                }, "+" + params.row.variablePoint),
              ]);
            } else {
              return h('div', [
                h('span', {
                  style: {
                    color: 'red'
                  }
                }, '-' + params.row.variablePoint),
              ]);
            }
          }
        },
        {
          title: "当前积分",
          key: "point",
          width: 150,
        },

      ],
      pointData: [],//历史积分数据
      pointTotal: 0,//历史积分总条数
      //历史积分数据查询form
      pointSearchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
      },
      orderColumns: [
        {
          title: "订单编号",
          key: "sn",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "订单金额",
          key: "flowPrice",
          width: 130,
          render: (h, params) => {
            return h("div", this.$options.filters.unitPrice(params.row.flowPrice, '￥'));
          }
        },
        {
          title: "订单类型",
          key: "orderType",
          width: 100,
          render: (h, params) => {
            if (params.row.orderType == "NORMAL") {
              return h('div', [h('span', {}, '普通订单'),]);
            } else if (params.row.orderType == "VIRTUAL") {
              return h('div', [h('span', {}, '虚拟订单'),]);
            } else if (params.row.orderType == "GIFT") {
              return h('div', [h('span', {}, '赠品订单'),]);
            } else if (params.row.orderType == "PINTUAN") {
              return h('div', [h('span', {}, '拼团订单'),]);
            }
          }
        },
        {
          title: "来源",
          key: "clientType",
          width: 80,render: (h, params) => {
            if (params.row.clientType == "H5") {
              return h("div",{},"移动端");
            }else if(params.row.clientType == "PC") {
              return h("div",{},"PC端");
            }else if(params.row.clientType == "WECHAT_MP") {
              return h("div",{},"小程序端");
            }else if(params.row.clientType == "APP") {
              return h("div",{},"移动应用端");
            }
            else{
              return h("div",{},params.row.clientType);
            }
          },
        },
        {
          title: "订单状态",
          key: "orderStatus",
          width: 95,
          render: (h, params) => {
            if (params.row.orderStatus == "UNPAID") {
              return h('div', [h('span', {}, '未付款'),]);
            } else if (params.row.orderStatus == "PAID") {
              return h('div', [h('span', {}, '已付款'),]);
            } else if (params.row.orderStatus == "UNDELIVERED") {
              return h('div', [h('span', {}, '待发货'),]);
            } else if (params.row.orderStatus == "DELIVERED") {
              return h('div', [h('span', {}, '已发货'),]);
            } else if (params.row.orderStatus == "COMPLETED") {
              return h('div', [h('span', {}, '已完成'),]);
            } else if (params.row.orderStatus == "TAKE") {
              return h('div', [h('span', {}, '待核验'),]);
            } else if (params.row.orderStatus == "CANCELLED") {
              return h('div', [h('span', {}, '已取消'),]);
            }
          }
        },
        {
          title: "支付状态",
          key: "payStatus",
          width: 95,
          render: (h, params) => {
            if (params.row.payStatus == "UNPAID") {
              return h('div', [h('span', {}, '未付款'),]);
            } else if (params.row.payStatus == "PAID") {
              return h('div', [h('span', {}, '已付款'),]);
            }
          }
        },
        {
          title: "售后状态",
          key: "groupAfterSaleStatus",
          width: 100,
          render: (h, params) => {
            if (params.row.groupAfterSaleStatus == "NEW") {
              return h('div', [h('span', {}, '未申请'),]);
            } else if (params.row.groupAfterSaleStatus == "NOT_APPLIED") {
              return h('div', [h('span', {}, '未申请'),]);
            } else if (params.row.groupAfterSaleStatus == "ALREADY_APPLIED") {
              return h('div', [h('span', {}, '已申请'),]);
            } else if (params.row.groupAfterSaleStatus == "EXPIRED") {
              return h('div', [h('span', {}, '已失效'),]);
            }
          }
        },
        {
          title: "投诉状态",
          key: "groupComplainStatus",
          width: 95,
          render: (h, params) => {
            if (params.row.groupComplainStatus == "NEW") {
              return h('div', [h('span', {}, '未申请'),]);
            } else if (params.row.groupComplainStatus == "NO_APPLY") {
              return h('div', [h('span', {}, '未申请'),]);
            } else if (params.row.groupComplainStatus == "APPLYING") {
              return h('div', [h('span', {}, '申请中'),]);
            } else if (params.row.groupComplainStatus == "COMPLETE") {
              return h('div', [h('span', {}, '已完成'),]);
            } else if (params.row.groupComplainStatus == "EXPIRED") {
              return h('div', [h('span', {}, '已失效'),]);
            } else if (params.row.groupComplainStatus == "CANCEL") {
              return h('div', [h('span', {}, '取消投诉'),]);
            }
          }
        },
        {
          title: "购买店铺",
          key: "storeName",
          width: 120,
          tooltip: true
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
          fixed: "right",
          render: (h, params) => {
            return h("div", {
              style: {
                display: "flex",
                justifyContent: "center"
              }
            }, [
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
                      this.orderDetail(params.row.sn);
                    },
                  },
                },
                "查看"
              ),
            ]);
          },
        },

      ],
      orderData: [],//订单数据
      orderTotal: 0,//订单总条数
      //TA的订单form
      orderSearchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        payStatus: "",
        orderSn: "",
        orderType: "",
      },
      addressColumns: [
        {
          title: "地址别名",
          key: "alias",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "收货人姓名",
          key: "name",
          minWidth: 90,
          tooltip: true
        },
        {
          title: "收货人电话",
          key: "mobile",
          width: 125,
        },

        {
          title: "地址",
          key: "consigneeAddressPath",
          minWidth: 160,
          tooltip: true

        },
        {
          title: "详细地址",
          key: "detail",
          minWidth: 180,
          tooltip: true
        },
        {
          title: "默认",
          key: "isDefault",
          width: 80,
          render: (h, params) => {
            if (params.row.isDefault == "1") {
              return h('div', [
                h('span', {}, "是"),
              ]);
            } else {
              return h('div', [
                h('span', {}, "否"),
              ]);
            }

          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 120,
          fixed: "right",
          render: (h, params) => {
            return h("div", {
              style: {
                display: "flex",
                justifyContent: "center"
              }
            }, [
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
                      this.memberAddressRemove(params.row);
                    },
                  },
                },
                "删除"
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
                      this.editAddress(params.row);
                    },
                  },
                },
                "编辑"
              ),
            ]);
          },
        },

      ],
      addressData: [],//历史积分数据
      addressTotal: 0,//历史积分总条数
      //TA的收货地址form
      addressSearchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
      },
      //消费记录
      walletColumns: [
        {
          title: "会员名称",
          key: "memberName",
          minWidth: 120,
        },
        {
          title: "业务类型",
          key: "serviceType",
          width: 200,
          render: (h, params) => {
            if (params.row.serviceType == "WALLET_WITHDRAWAL") {
              return h("div", [h("span", {}, "余额提现")]);
            } else if (params.row.serviceType == "WALLET_PAY") {
              return h("div", [h("span", {}, "余额支付")]);
            } else if (params.row.serviceType == "WALLET_REFUND") {
              return h("div", [h("span", {}, "余额退款")]);
            } else if (params.row.serviceType == "WALLET_RECHARGE") {
              return h("div", [h("span", {}, "余额充值")]);
            } else {
              return h("div", [h("span", {}, "佣金提成")]);
            }
          },
        },
        {
          title: "变动金额",
          key: "money",
          width: 150,
          render: (h, params) => {
            if (params.row.money >0) {
              return h('div', [
                h('span', {
                  style:{
                    color: 'green'
                  }
                }, this.$options.filters.unitPrice(params.row.money,'￥')),
              ]);
            } else if (params.row.money < 0) {
              return h('div', [
                h('span', {
                  style:{
                    color: 'red'
                  }
                }, this.$options.filters.unitPrice(params.row.money,'￥')),
              ]);
            }
          },
        },
        {
          title: "变动时间",
          key: "createTime",
          width: 170,
        },
        {
          title: "变动明细",
          key: "detail",
          minWidth: 400,
          tooltip: true
        },
      ],
      //TA的余额消费记录
      walletSearchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      walletData: [],//历史积分数据
      walletTotal: 0,//历史积分总条数
      //TA的发票记录
      receiptRecordSearchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      receiptRecordColumns: [
        {
          title: "订单编号",
          key: "orderSn",
          width: 260,
          slot: "orderSnSlot",
        },
        {
          title: "发票抬头",
          key: "receiptTitle",
          minWidth: 130,
          tooltip: true
        },
        {
          title: "纳税人识别号",
          key: "taxpayerId",
          minWidth: 130,
          tooltip: true
        },
        {
          title: "发票金额",
          key: "receiptPrice",
          width: 130,
          render: (h, params) => {
            if(params.row.receiptPrice == null){
              return h("div", this.$options.filters.unitPrice(0, '￥'));
            }else{
              return h("div", this.$options.filters.unitPrice(params.row.receiptPrice, '￥'));
            }

          }
        },
        {
          title: "发票内容",
          key: "receiptContent",
          minWidth: 120,
          tooltip: true
        },
      ],
      receiptRecordData: [],//发票记录数据
      receiptRecordTotal: 0,//发票记录总条数
    };
  },
  methods: {
    init() {
      this.getRobotInfo();
      //查询会员的历史积分数据
      this.addPost();
    },
    // 信息初始化
    getRobotInfo() {
      API_Robot.getRobotInfoData(this.id).then((res) => {
        this.$set(this, "memberInfo", res.result);
      });
    },
    // 查询机器人基本信息
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$Message.success('Success!');
        } else {
          this.$Message.error('Fail!');
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields();
    },


    robotOperationChange(v) {
      if (v === "point") {
        // 无查询操作
      }
      // 发想法
      if (v === "address") {
        this.getAddressData();
      }
      if (v === "order") {
        this.getOrderData();
      }
      if (v === "wallet") {
        this.getMemberWalletData();
        this.getDepositLogData();
      }
      if(v === "receipt"){
        this.getReceiptRecordData();
      }
    },
    // 功能切换
    addNewPost() {
      this.$refs.postForm.validate((valid) => {
        if (valid) {
          API_Robot.addANewPost(this.postForm).then((res) => {
            if (res.result) {
              this.$refs.postForm.resetFields();
              this.$Message.success("添加成功！");
            }
          });
        }
      });
    },
    // 发想法



    //查询会员信息

    //会员状态改变事件
    memberStatusChange(v) {
      let params = {
        memberIds: [this.id],
        disabled: v
      }
      API_Member.updateMemberStatus(params).then(res => {
      });
    },
    //查询TA的余额disabled
    getMemberWalletData() {
      this.loading = true;
      let params = {
        memberId: this.id
      }
      API_Member.getMemberWallet(params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.memberWalletInfo = res.result;
        }
      });
      this.loading = false;

    },
    //查询TA的余额消费记录
    getDepositLogData(){
      this.loading = true;
      this.walletSearchForm.memberId = this.id
      API_Member.getUserWallet(this.walletSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.walletData = res.result.records;
          this.walletTotal = res.result.total;
        }
      });
      this.loading = false;
    },

    //查询TA的发票记录
    getReceiptRecordData(){
      this.loading = true;
      this.receiptRecordSearchForm.memberId = this.id
      API_Order.getReceiptPage(this.receiptRecordSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.receiptRecordData = res.result.records;
          this.receiptRecordTotal = res.result.total;
        }
      });
      this.loading = false;
    },

    //查询TA的订单
    getOrderData() {
      this.loading = true;
      this.orderSearchForm.memberId = this.id
      API_Order.getOrderList(this.orderSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.orderData = res.result.records;
          this.orderTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    //跳转到订单详情页面
    orderDetail(v) {
      this.$router.push({
        name: "order-detail",
        query: {sn: v},
      });
    },
    //查询TA的历史积分数据
    addPost() {
      this.loading = true;
      this.pointSearchForm.memberId = this.id
      API_Member.getHistoryPointData(this.pointSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.pointData = res.result.records;
          this.pointTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    //新增TA的收货地址
    addMemberAddress() {
      this.addressModalTitle = "新增会员地址";
      this.addressModalVisible = true
      this.addressForm = {
        id: "",
        isDefault: "0",
      }

    },
    //修改TA的收货地址
    editAddress(v) {
      this.addressModalTitle = "修改会员地址";
      this.$set(this, "addressForm", v);
      delete this.addressForm.updateTime;
      this.addressModalVisible = true
    },
    //新增或者修改表单提交
    addressSubmit() {
      this.addressForm.memberId = this.id
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          let submit = JSON.parse(JSON.stringify(this.addressForm))
          submit.isDefault == "1" ? submit.isDefault  = true :  submit.isDefault = false
          if (submit.id != "") {
            //修改地址
            API_Member.editMemberAddress(submit).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                this.$Message.success("修改成功");
                this.addressModalVisible = false
                this.getAddressData();
              }
            });
          } else {
            //添加地址
            API_Member.addMemberAddress(submit).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                this.$Message.success("添加成功");
                this.addressModalVisible = false
                this.getAddressData();
              }
            });
          }
        }
      })

    },
    //获取地址
    getAddress(item) {
      this.$set(this.addressForm, 'consigneeAddressPath', item.addr)
      this.$set(this.addressForm, 'consigneeAddressIdPath', item.addrId)
      this.addressForm.address = item.address
      this.addressForm.lat = item.position.lat
      this.addressForm.lon = item.position.lng
    },
    //删除会员地址
    memberAddressRemove(v) {
      this.$Modal.confirm({
        title: '删除',
        content: '<p>确定要删除此收货地址？</p>',
        onOk: () => {
          API_Member.removeMemberAddress(v.id).then((res) => {
            if (res.success) {
              this.$Message.success('删除成功');
              this.getAddressData();
            }
          });
        }
      })
    },
    //查询TA的收货地址
    getAddressData() {
      this.loading = true;
      API_Member.getMemberAddressData(this.id, this.addressSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.addressData = res.result.records;
          this.addressTotal = res.result.total;
        }
      });
      this.loading = false;
    }
    ,
    //积分记录页数变化
    pointChangePage(v) {
      this.pointSearchForm.pageNumber = v;
      this.addPost();
    }
    ,
    //积分记录页数变化
    pointChangePageSize(v) {
      this.pointSearchForm.pageNumber = 1;
      this.pointSearchForm.pageSize = v;
      this.addPost();
    }
    ,
    //会员地址记录页数变化
    addressChangePage(v) {
      this.addressSearchForm.pageNumber = v;
      this.getAddressData()
    }
    ,
    //会员地址记录页数变化
    addressChangePageSize(v) {
      this.addressSearchForm.pageNumber = 1;
      this.addressSearchForm.pageSize = v;
      this.addPost();
    },

    //余额记录页数变化
    walletChangePage(v) {
      this.walletSearchForm.pageNumber = v;
      this.getDepositLogData();
    }
    ,
    //余额记录页数变化
    walletChangePageSize(v) {
      this.walletSearchForm.pageNumber = 1;
      this.walletSearchForm.pageSize = v;
      this.getDepositLogData();
    },

    //订单记录页数变化
    orderChangePage(v) {
      this.orderSearchForm.pageNumber = v;
      this.getOrderData()
    }
    ,
    //订单记录页数变化
    orderChangePageSize(v) {
      this.orderSearchForm.pageNumber = 1;
      this.orderSearchForm.pageSize = v;
      this.getOrderData();
    },
    // 起止时间从新赋值
    selectDateRange(v) {
      if (v) {
        this.orderSearchForm.startDate = v[0];
        this.orderSearchForm.endDate = v[1];
      }
    },
  },

  mounted() {
    this.id = this.$route.query.id;
    this.init();
  }
  // 挂载时立刻获得 和初始信息
  ,
};
</script>
<style lang="scss" scoped>
@import "memberDetail.scss";
</style>
