<template>
  <div class="search">
    <Card>
      <Row class="operation padding-row" v-if="!selectedMember">
        <Col span="22">
          <Button @click="addRobot" type="primary" icon="ios-add">添加机器人</Button>
        </Col>
      </Row>
      <Table :loading="loading" border :columns="columns" class="mt_10" :data="data" ref="table"></Table>
      <Row type="flex" justify="center" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
              @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="default" show-total
              show-elevator
              show-sizer></Page>
      </Row>
    </Card>

    <Modal v-model="addFlag" title="添加机器人">
      <Form ref="addMemberForm" :model="addMemberForm"  :label-width="100">
        <FormItem label="昵称" prop="nickName" style="width: 90%">
          <Input v-model="addMemberForm.nickName" maxlength="15" placeholder="请输入机器人昵称"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="addFlag = false">取消</Button>
        <Button type="primary" @click="addMemberSubmit">确定</Button>
      </div>
    </Modal>

    <Modal v-model="descFlag" :title="descTitle" @on-ok="handleSubmitModal" width="500">
      <Form ref="form" :model="form" :rules="ruleValidate" :label-width="80">
        <Input v-model="form.id" v-show="false"/>
        <FormItem label="头像">
          <img :src="form.face" class="face"/>
          <Button type="text" class="upload" @click="() => {
                this.picModelFlag = true;
                this.$refs.ossManage.selectImage = true;
              }">修改
          </Button>
          <input type="file" style="display: none" id="file"/>
        </FormItem>
        <FormItem label="ID" prop="name">
          <Input v-model="form.username" style="width: 200px" disabled/>
        </FormItem>
        <FormItem label="昵称" prop="name">
          <Input v-model="form.nickName" style="width: 200px"/>
        </FormItem>
      </Form>
    </Modal>

    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage"/>
    </Modal>
  </div>
</template>

<script>
import region from "@/components/region";
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from "@/libs/RegExp.js";
import {getTenantArea} from "@/api/tenant";
import Cookies from "js-cookie";
import {managerUrl} from "@/libs/axios.js";

export default {
  name: "RobotList",
  components: {
    region,
    ossManage,
  },
  data() {
    return {
      addFlag: false,
      // 新增框显隐
      descFlag: false,
      // 编辑框显隐

      addRule: {
        mobile: [
          {required: true, message: "请输入手机号码"},
          {
            pattern: RegExp.mobile,
            message: "请输入正确的手机号",
          },
        ],
        username: [{required: true, message: "请输入学号"}],
        password: [{required: true, message: "请输入密码"}],
        studentId: [{required: true, message: "请输入姓名"}],
      },
      // 新增表单验证
      ruleValidate: {},
      // 编辑表单验证

      descTitle: "",
      // 表单标题

      loading: true,
      // 表格加载状态

      columns: [
        {
          title: "序列",
          key: "username",
          align: "center",
        },
        {
          title: "昵称",
          key: "nickName",
          align: "center",
        },
        {
          title: "注册时间",
          key: "createTime",
          align: "center",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "center",
                },
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                      display: this.selectedMember ? "none" : "block",
                    },
                    on: {
                      click: () => {
                        this.detail(params.row);
                      },
                    },
                  },
                  "操作"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small",
                      ghost: true,
                    },
                    style: {
                      marginRight: "5px",
                      display: this.selectedMember ? "none" : "block",
                    },
                    on: {
                      click: () => {
                        this.editTheRobot(params.row);
                      },
                    },
                  },
                  "编辑"
                ),
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                      type: "error",
                    },
                    style: {
                      marginRight: "5px",
                      display: this.selectedMember ? "none" : "block",
                    },
                    on: {
                      click: () => {
                        this.deleteTheRobot(params.row);
                      },
                    },
                  },
                  "删除"
                ),
              ]
            );
          },
        },
      ],
      // 表格格式

      data: [],
      // 表格数据
      total: 0,
      // 表格数据总数

      addMemberForm: {
        nickName: "",
      },
      // 添加用户表单
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        order: "desc",
        username: "",
        mobile: "",
        nickName: "",
        disabled: "OPEN",
        studentId: "",
      },
      // 请求参数


      accessToken: {}, // 验证token
      importModal: false,
      action: managerUrl + "/goods/import/import", // 上传接口
      updateRegion: false, // 地区
      tenantList: [],
      // 显示搜索条件
      showSearch: true,
      userInfo: JSON.parse(Cookies.get("userInfoManager")),


      picModelFlag: false, // 选择图片
      form: {}, // 表单数据


      selectMember: [], //保存选中的用户
    };
  },
  props: {
    // 是否为选中模式
    selectedMember: {
      type: Boolean,
      default: false,
    },
    // 已选择用户数据
    selectedList: {
      type: null,
      default: () => {
        return [];
      },
    },
  },
  watch: {
    selectedList: {
      handler(val) {
        this.$set(this, "selectMember", JSON.parse(JSON.stringify(val)));
        this.init(this.data);
        // 将父级数据与当前组件数据进行匹配
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    detail(row) {
      this.$router.push({name: "robotDetail", query: {id: row.id}});
      console.log("查看", row);
      console.log("id:", row.id);
    },
    // 查看机器人

    editTheRobot(val) {
      this.descTitle = `${val.nickName}`;
      this.descFlag = true;
      this.updateRegion = false;
      this.getRobot(val.id);
      console.log("更改", val);
    },
    // 编辑机器人
    getRobot(id) {
      API_Member.getRobotInfo(id).then((res) => {
        if (res.result) {
          this.$set(this, "form", res.result);
          this.form.tenantIds = res.result.tenants.map(item => {
            return item.id;
          })
        }
      });
    },

    deleteTheRobot(val) {
      this.deleteRobot(val.id);
      console.log("删除", val);
    },
    // 删除机器人
    deleteRobot(id) {
      API_Member.deleteRobotInfo(id);
      this.$Message.success("删除成功！");
      // this.getData();
      setTimeout(() => this.getData(), 300);
    },


    //添加会员提交
    addMemberSubmit() {
      this.$refs.addMemberForm.validate((valid) => {
        if (valid) {
          API_Member.addRobot(this.addMemberForm).then((res) => {
            if (res.result) {
              this.$refs.addMemberForm.resetFields();
              this.getData();
              this.$Message.success("添加成功！");
              this.addFlag = false;
            }
          });
        }
      });
    },

    // 回调给父级
    callback(val, index) {
      this.$set(val, "___selected", !val.___selected);
      console.log(val.___selected);
      console.log(this.selectMember);
      let findUser = this.selectMember.find((item) => {
        return item.id == val.id;
      });
      // 如果没有则添加
      if (!findUser) {
        this.selectMember.push(val);
      } else {
        // 有重复数据就删除
        this.selectMember.map((item, index) => {
          if (item.id == findUser.id) {
            this.selectMember.splice(index, 1);
          }
        });
      }

      this.$emit("callback", val);
    },
    // 初始化信息
    init(data) {
      data.forEach((item) => {
        if (this.selectMember.length != 0) {
          this.selectMember.forEach((member) => {
            if (member.id == item.id) {
              this.$set(item, "___selected", true);
            }
          });
        } else {
          this.$set(item, "___selected", false);
        }
      });
      this.data = data;
      this.getTenantList();
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
      this.getData();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    openImportMembers() {
      this.importModal = true
    },
// 上传数据


    addRobot() {
      this.addFlag = true;
      this.$refs.addMemberForm.resetFields();
    },
    /**
     * 查询查看会员详情
     */



    //查询会员列表
    getData() {
      this.loading = true;
      API_Member.getRobotListData(this.searchForm).then((res) => {
        if (res.result.records) {
          this.loading = false;
          this.init(res.result.records);
          this.total = res.result.total;
        }
      });
    },

    // 选中的图片
    callbackSelected(val) {
      this.picModelFlag = false;
      this.form.face = val.url;
    },


    // 选中的地址
    selectedRegion(val) {
      this.region = val[1];
      this.regionId = val[0];
    },
    //查看会员

    // 提交修改数据
    handleSubmitModal() {
      const {nickName, sex, username, face, newPassword, id, tenantIds, studentId} = this.form;
      let time = new Date(this.form.birthday);
      let birthday = time ?
        time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() : '';
      let submit = {
        regionId: this.form.regionId,
        region: this.form.region,
        nickName,
        username,
        sex,
        birthday,
        face,
        id,
        studentId,
        tenantIds
      };
      if (this.region != "undefined") {
        submit.regionId = this.regionId;
        submit.region = this.region;
      }
      if (newPassword) {
        submit.password = this.md5(newPassword);
      }
      API_Member.updateRobot(submit).then((res) => {
        if (res.result) {
          this.$Message.success("修改成功！");
          this.getData();
        }
      });
    },
  },
  mounted() {
    if (!this.userInfo.isSuper && this.userInfo.tenantId) {
      this.searchForm.tenantId = this.userInfo.tenantId;
      this.columns = this.columns.filter(col => col.key !== 'tenants');
    }
    this.getData();
  },
};
</script>
<style lang="scss" scoped>
/deep/ .ivu-table-wrapper {
  width: 100%;
}

/deep/ .ivu-card {
  width: 100%;
}

.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>
