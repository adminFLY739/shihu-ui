<template>
  <div class="search">
    <Row>
      <Card>
        <Row @keydown.enter.native="handleSearch">
          <Form
            ref="searchForm"
            :model="searchForm"
            inline
            :label-width="70"
            class="search-form"
            v-show="showSearch"
          >
            <Form-item label="用户名称" prop="username">
              <Input
                type="text"
                v-model="searchForm.username"
                placeholder="请输入用户名称"
                clearable
                style="width: 200px"
              />
            </Form-item>

            <Form-item label="联系方式" prop="mobile">
              <Input
                type="text"
                v-model="searchForm.mobile"
                placeholder="请输入用户联系方式"
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
              class="search-btn"
              type="primary"
              icon="ios-search"
            >搜索</Button
            >
            <Button @click="resetting" class="search-btn" type="info" icon="ios-refresh">重置</Button>
          </Form>
        </Row>
        <Row class="operation padding-row" v-if="!selectedMember">
          <Col span="22">
          </Col>
          <Col span="2">
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getData"></right-toolbar>
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
        >
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
    </Row>

    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage" />
    </Modal>
  </div>
</template>

<script>
import region from "@/components/region";
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import RightToolbar from "@/components/RightToolbar/index.vue";
import Cookies from "js-cookie";
import {getTenantArea} from "@/api/tenant";
import {getMemberTenant, updateMemberTenantStatus} from "@/api/member.js";

export default {
  name: "memberRecycle",
  components: {
    region,
    ossManage,
    RightToolbar,
  },
  data() {
    return {
      selectedMember: false, //是否是其他组件调用
      descTitle: "", // modal标题
      descFlag: false, //编辑查看框
      openSearch: true, // 显示搜索
      loading: true, // 表单加载状态
      updateRegion: false, // 显示所在地
      showSearch: true,
      userInfo: JSON.parse(Cookies.get("userInfoManager")),
      tenantList: [],
      searchForm: {
        // 请求参数
        pageNumber: 1,
        pageSize: 10,
        order: "desc",
        username: "",
        mobile: "",
        memberStatus: "CLOSED",
      },
      picModelFlag: false, // 选择图片
      formValidate: {}, // 表单数据
      ruleValidate: {}, //修改验证
      columns: [
        {
          title: "用户名称",
          align: "left",
          key: "username",
          tooltip: true,
        },
        {
          title: "昵称",
          align: "left",
          key: "nickName",
          tooltip: true,
        },
        {
          title: "联系方式",
          width: 130,
          key: "mobile",
          render: (h, params) => {
            if (params.row.mobile == null) {
              return h("div", [h("span", {}, "")]);
            } else {
              return h("div", [h("span", {}, params.row.mobile)]);
            }
          },
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 180,
        },

        {
          title: "所属租户",
          align: "left",
          key: "name",
          width: 200,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          fixed: "right",
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
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                      display: this.selectedMember ? "block" : "none",
                    },
                    on: {
                      click: () => {
                        this.callback(params.row);
                      },
                    },
                  },
                  "选择"
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

                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                      type: "success",
                    },
                    style: {
                      marginRight: "5px",
                      display: this.selectedMember ? "none" : "block",
                    },
                    on: {
                      click: () => {
                        this.enable(params.row);
                      },
                    },
                  },
                  "启用"
                ),

              ]
            );
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    // 回调给父级
    callback(val) {
      this.$emit("callback", val);
    },
    // 初始化数据
    init() {
      this.getTenantList();
      this.getData();
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
    // 分页 修改页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    // 分页 修改页数
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getData();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getData();
    },
    //查看详情修改
    editPerm(val) {
      this.descTitle = `查看用户 ${val.username}`;
      this.descFlag = true;
      this.updateRegion = false;
      this.getMemberInfo(val.id);
    },
    /**
     * 查询查看会员详情
     */
    getMemberInfo(id) {
      API_Member.getMemberInfoData(id).then((res) => {
        if (res.result) {
          this.$set(this, "formValidate", res.result);
        }
      });
    },
    //查询会员列表
    getData() {
      this.loading=true;
      API_Member.getMemberTenant(this.searchForm).then((res) => {
        if (res.success) {
          this.loading = false;
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    //重置搜索条件
    resetting(){
      this.$refs.searchForm.resetFields();
      this.handleSearch();
    },
    // 选中的图片
    callbackSelected(val) {
      this.picModelFlag = false;
      this.formValidate.face = val.url;
    },

    // 选中的地址
    selectedRegion(val) {
      this.region = val[1];
      this.regionId = val[0];
    },

    //详细
    detail(row) {
      this.$router.push({ name: "member-detail", query: { id: row.memberId } });
    },
    //启用会员
    enable(v) {
      let params = {
        memberId: v.memberId,
        tenantId: v.tenantId,
        memberStatus: "OPEN",
      };
      this.$Modal.confirm({
        title: "提示",
        content: "<p>是否启用此用户？</p>",
        onOk: () => {
          API_Member.updateMemberTenantStatus(params).then((res) => {
            if (res.success) {
              this.$Message.success("启用成功");
              this.getData();
            } else {
              // this.$Message.error(res.message);
            }
          });
        },
      });
    },
    //拒绝用户
    reject(v) {
      let params = {
        memberId: v.memberId,
        tenantId: v.tenantId,
        memberStatus: "REFUSED",
      };
      this.$Modal.confirm({
        title: "提示",
        content: "<p>是否拒绝通过此用户？</p>",
        onOk: () => {
          API_Member.updateMemberTenantStatus(params).then((res) => {
            if (res.success) {
              this.$Message.success("拒绝成功");
              this.getData();
            } else {
              // this.$Message.error(res.message);
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
<style lang="scss" scoped>
.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>
