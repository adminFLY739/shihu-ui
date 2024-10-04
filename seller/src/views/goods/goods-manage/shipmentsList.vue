<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <Button @click="add" type="primary" icon="md-add">添加</Button>
        <Button @click="delAll" icon="md-trash">批量删除</Button>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
        @on-selection-change="changeSelect"
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
    <Modal
      :title="modalTitle"
      v-model="modalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form ref="form" :model="form" :label-width="120" :rules="formValidate">
        <FormItem label="发货地名称" prop="name">
          <Input v-model="form.name" clearable style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="handleSubmit"
          >提交</Button
        >
      </div>
    </Modal>
    <Modal
      title="选择发货人员"
      v-model="clerkVisible"
      :mask-closable="false"
      :width="500"
    >
      <Select v-model="clerkIds" multiple >
        <Option v-for="item in clerkList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <div slot="footer">
        <Button type="text" @click="clerkVisible = false">取消</Button>
        <Button type="primary" :loading="clerkSubmitLoading" @click="clerkSubmit"
        >提交</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  addShipments,
  getShipmentsList,
  updateShipments,
  delShipments,
  addShipmentsClerk,
  getShipmentsClerkList
} from "@/api/goods";
import {getUserListData} from "@/api/index"
import {regular} from "@/utils";

export default {
  name: "goods-unit",
  data() {
    return {
      loading: true, // 表单加载状态
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      clerkVisible: false,
      clerkIds:[],
      shipmentsId:[],
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        name: "",
      },
      clerkList: [
        {
          value: 'New York',
          label: 'New York'
        },
        {
          value: 'London',
          label: 'London'
        },
        {
          value: 'Sydney',
          label: 'Sydney'
        },
        {
          value: 'Ottawa',
          label: 'Ottawa'
        },
        {
          value: 'Paris',
          label: 'Paris'
        },
        {
          value: 'Canberra',
          label: 'Canberra'
        }
      ],
      form: {
        // 添加或编辑表单对象初始化数据
        name: "",
      },
      // 表单验证规则
      formValidate: {
        name: [
          regular.REQUIRED,
          regular.VARCHAR5
        ]
      },
      submitLoading: false, // 添加或编辑提交状态
      clerkSubmitLoading: false,
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "发货地名称",
          key: "name",
          minWidth: 120
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 180
        },
        {
          title: "更新时间",
          key: "updateTime",
          width: 180
        },
        {
          title: "操作人",
          key: "createBy",
          minWidth: 150
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 300,
          render: (h, params) => {
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
                      this.edit(params.row);
                    },
                  },
                },
                "修改"
              ),
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
                      this.addClerk(params.row);
                    },
                  },
                },
                "添加发货员"
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
                      this.remove(params.row);
                    },
                  },
                },
                "删除"
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
      this.getClerkList();
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
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
    // 清除选中
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    // 选中回调
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      getShipmentsList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    getClerkList(){
      let params = {
        pageNumber: 1,
        pageSize: 150,
        sort: "createTime",
        order: "desc"
      }
      getUserListData(params).then(res => {
        if (res.success) {
          this.clerkList = res.result.records.map(item=>{return {value:item.id , label:item.clerkName}})
        }
      });
    },
    // 修改后提交
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;

          if (this.modalTitle == "添加") {

            if(this.data.find(item=>item.name == this.form.name)){
              this.$Message.error('请勿添加商品发货地!')
              this.submitLoading = false
              return
            }
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id;
            addShipments(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          } else {
            // 编辑
            updateShipments(this.id, this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          }
        }
      });
    },
    clerkSubmit(){
      this.clerkSubmitLoading = true;
      let params = {
        clerkIds: this.clerkIds,
        shipmentsId: this.shipmentsId,
      }
      addShipmentsClerk(params).then(res=>{
        this.clerkSubmitLoading = false;
        if(res.success){
          this.$Message.success("操作成功");
          this.clerkVisible=false;
        }
      })
    },
    // 添加
    add() {
      this.modalTitle = "添加";
      this.form = {};
      this.$refs.form.resetFields();
      this.modalVisible = true;
    },
    // 编辑
    edit(v) {
      this.id = v.id;
      this.modalTitle = "修改";
      this.modalVisible = true;
      this.form.name = v.name;
      this.form.appid = v.appid;
    },
    addClerk(v){
      this.shipmentsId = v.id;
      this.clerkVisible = true;
      getShipmentsClerkList({shipmentsId:this.shipmentsId}).then(res=>{
        if(res.success){
          this.clerkIds = res.result.map(item => item.id);
          console.log(this.clerkIds);
        }
      })
    },
    // 删除
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除 " + v.name + " ?",
        loading: true,
        onOk: () => {
          // 删除
          delShipments(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    // 全部删除
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          // 批量删除
          delShipments(ids).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        }
      });
    }
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.operation {
  margin: 10px 0;
}
</style>
