<template>
  <Card >
    <Tabs v-model="selected" @on-click="clickTab">
      <TabPane :label="tabItem.name" :name="tabItem.type" v-for="(tabItem, tabIndex) in tabWay" :key="tabIndex">

        <Table
          :loading="loading"
          border
          :columns="columns"
          :data="data"
          ref="table"
          class="mt_10"
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
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
import {getServiceStatistics} from "@/api";

export default {
  name: "serviceStatistics",
  data(){
    return {
      selected: "WechatMPLogin", // 已选
      loading: true, // 表单加载状态
      tabWay: [
        {type: "WechatMPLogin", name: "微信小程序登录"},
        //微信支付设置
        {type: "LOGISTICS", name: "快递鸟接口"},
        {type: "SMS", name:"短信发送接口"},
        {type: "OSS", name:"OSS使用空间"}
      ],
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        order: "desc", // 默认排序方式
      },
      columns: [
        {
          title: "租户名称",
          key: "name",
          minWidth: 80,
        },
        {
          title: "调用次数",
          key: "count",
          minWidth: 120,
          render: (h, params) => {
            if(this.selected==="OSS") {
              let m =
                ((params.row.count * 1.0) / (1024 * 1024)).toFixed(2) + " MB";
              return h("span", m);
            }else{
              return h("span", params.row.count);
            }
          },
        },
        {
          title: "最近使用时间",
          key: "updateTime",
          minWidth: 120,
        },
      ],
      data:[],
      total:0,
    }
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    // tab切换
    clickTab(name) {
      this.selected = name;
      if(name === "OSS" ) {
        this.columns[1].title = "使用空间"
      }else{
        this.columns[1].title = "调用次数"
      }
      this.getDataList();
    },
    changePage(v) {
      // 改变页码
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      // 改变页数
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 获取数据
    getDataList() {
      this.loading = false;
      getServiceStatistics(this.searchForm,this.selected).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.loading = true;
    },
  },
}
</script>

<style scoped>

</style>
