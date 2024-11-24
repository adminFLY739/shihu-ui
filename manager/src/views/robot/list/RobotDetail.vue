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
            <FormItem label="标题" prop="title">
              <Input v-model="formValidate.title" placeholder="标题"></Input>
            </FormItem>
            <FormItem label="内容" prop="content">
              <Input v-model="formValidate.content" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="说些什么叭...(不超过400字)"></Input>
            </FormItem>
            <FormItem label="图片" prop="media">
              <div>
                <div v-for="(img, index) in formValidate.media" :key="index" style="display: inline-block; margin: 5px;">
                  <img :src="img" style="width: 120px; height: 80px; object-fit: cover;"/>
                  <br>
                  <Button type="error" @click="removeImage(index)">删除</Button>
                </div>
              </div>
              <Button type="text" icon="ios-cloud-upload-outline" @click="() => {
                    this.picModelFlag = true;
                    this.$refs.ossManage.selectImage = true;
                  }">上传图片
              </Button>
              <input
                type="file"
                id="file"
                multiple
                style="display: none"
              />
            </FormItem>
            <FormItem label="分类" prop="cut">
              <CheckboxGroup v-model="formValidate.cut">
                <Checkbox v-for="category in categories" :key="category.cateId" :label="category.cateId">{{ category.cateName }}</Checkbox>
              </CheckboxGroup>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="handleSubmit()">提交</Button>
              <Button @click="handleReset()" style="margin-left: 8px">重置</Button>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="发话题" name="order" style="min-height: 200px">
          <Form ref="form" :model="form" :rules="discussRuleValidate" :label-width="80">
            <FormItem label="标题" prop="title">
              <Input v-model="form.title" placeholder="标题"></Input>
            </FormItem>
            <FormItem label="内容" prop="description">
              <Input v-model="form.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="说些什么叭...(不超过400字)"></Input>
            </FormItem>
            <FormItem label="分类" prop="cut">
              <CheckboxGroup v-model="form.cut">
                <Checkbox v-for="category in categories" :key="category.cateId" :label="category.cateId">{{ category.cateName }}</Checkbox>
              </CheckboxGroup>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="handleDicussSubmit()">提交</Button>
              <Button @click="handleDiscussReset()" style="margin-left: 8px">重置</Button>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="点赞&收藏&评论" name="address">
          <Table
            :loading="loading"
            border
            :columns="postColumns"
            :data="postData"
            ref="table"
            class="mt_10"
          >
            <template slot="postSlot" slot-scope="{ row }">
              <div style="margin: 5px 0px; height: 80px; display: flex">
                <img
                  v-for="(image, index) in JSON.parse(row.media)"
                  :key="index"
                  :src="image.trim()"
                  style="height: 60px; margin-top: 1px; width: 60px; margin-right: 10px;"
                />
              </div>
            </template>
          </Table>
          <Row type="flex" justify="center" class="mt_10">
            <Page
              :current="searchFormPost.pageNumber"
              :total="postTotal"
              :page-size="searchFormPost.pageSize"
              @on-change="changePagePost"
              @on-page-size-change="changePageSizePost"
              :page-size-opts="[10, 20, 50]"
              size="default"
              show-total
              show-elevator
              show-sizer
            ></Page>
          </Row>
        </TabPane>
        <TabPane label="回答&邀请&关注" name="wallet">
          <Table
            :loading="loading"
            border
            :columns="discussColumns"
            :data="discussData"
            ref="table"
            class="mt_10"
          >
          </Table>
          <Row type="flex" justify="center" class="mt_10">
            <Page
              :current="searchFormDiscuss.pageNumber"
              :total="discussTotal"
              :page-size="searchFormDiscuss.pageSize"
              @on-change="changePageDiscuss"
              @on-page-size-change="changePageSizeDiscuss"
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
    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage"/>
    </Modal>
    <Modal v-model="commentFlag" title="添加评论">
      <Form ref="addPostCommentForm" :modal="addPostCommentForm" :label-width="100" @submit.prevent @keydown.enter.prevent>
        <FormItem label="评论" prop="content" style="width: 90%">
          <Input v-model="addPostCommentForm.content" style="width: 200px" placeholder="请输入评论" @submit.prevent @keydown.enter.prevent/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="commentFlag = false">取消</Button>
        <Button type="primary" @click="handleComment">确定</Button>
      </div>
    </Modal>
    <Modal v-model="replyFlag" title="发表回答" :rules="replyRule">
      <Form ref="replyForm" :model="replyForm" :label-width="100">
        <FormItem label="回答" prop="description" style="width: 90%">
          <Input v-model="replyForm.description" style="width: 200px" placeholder="请输入回答"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="replyFlag = false">取消</Button>
        <Button type="primary" @click="handleReply">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import region from "@/components/region";
import * as API_Member from "@/api/member.js";
import * as API_Robot from "@/api/robot.js";
import * as API_Category from "@/api/category";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from '@/libs/RegExp.js';
import * as API_Order from "@/api/order.js";
import {addPostCollection, addPostComment, addPostThumb, getPostListData} from "@/api/post";
import member from "@/views/statistics/member.vue";
import {getDiscussListData} from "@/api/discuss";

export default {
  name: "robotDetail",
  components: {
    region,
    ossManage
  },
  data() {
    return {
      commentFlag: false,
      replyFlag: false,
      searchFormPost: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        order: "desc", // 默认排序方式
        goodsName:"",
        id:"",
        storeName:"",
        marketEnable:"",
      },
      searchFormDiscuss: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        order: "desc", // 默认排序方式
        goodsName:"",
        id:"",
        storeName:"",
        marketEnable:"",
      },
      picModelFlag: false,
      // 选择图片
      memberInfo: {},
      // 机器人基本信息
      formValidate: {
        title: '',
        type: 1,
        topicId: 2,
        discussId: '',
        content: '',
        media: [],
        longitude: 0,
        latitude: 0,
        address: '',
        cut: [],
        pay: '',
        uid: '',
      },
      form: {
        title: '',
        discussId: '',
        description: '',
        cut: [],
        uid: '',
      },
      ruleValidate: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        cut: [
          { required: true, type: 'array', min: 1, message: '请选择分类', trigger: 'change' },
          { type: 'array', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { type: 'string', min: 1, message: 'Introduce no less than 1 words', trigger: 'blur' }
        ]
      },
      replyRule: {
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { type: 'string', min: 1, message: 'Introduce no less than 1 words', trigger: 'blur' }
        ]
      },
      discussRuleValidate: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        cut: [
          { required: true, type: 'array', min: 1, message: '请选择分类', trigger: 'change' },
          { type: 'array', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { type: 'string', min: 1, message: 'Introduce no less than 1 words', trigger: 'blur' }
        ]
      },
      id: "",//会员id
      loading: true, // 表单加载状态
      categories: [],
      postTotal: 0,
      discussTotal: 0,
      postData: [],
      discussData: [],
      postColumns: [
        {
          title: "id",
          key: "id",
          width: 70,
        },
        {
          title: "uid",
          key: "uid",
          width: 190,
        },
        {
          title: "归属",
          key: "discussId",
          width: 170,
        },
        {
          title: "标题",
          key: "title",
          width: 170,
        },
        {
          title: "内容",
          key: "content",
          width: 200,
        },
        {
          title: "图片",
          key: "media",
          width: 300,
          slot: "postSlot",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
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
                        this.thumbPost(params.row);
                      },
                    },
                  },
                  "点赞"
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
                        this.collectionPost(params.row);
                      },
                    },
                  },
                  "收藏"
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
                        this.commentPost(params.row);
                      },
                    },
                  },
                  "评论"
                ),
              ]
            );
          },
        },
      ],
      discussColumns: [
        {
          title: "id",
          key: "id",
          width: 70,
        },
        {
          title: "uid",
          key: "uid",
          width: 190,
        },
        {
          title: "提问",
          key: "title",
          width: 170,
        },
        {
          title: "内容",
          key: "description",
          width: 200,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
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
                        this.replyDiscuss(params.row);
                      },
                    },
                  },
                  "回答"
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
                        this.inviteMember(params.row);
                      },
                    },
                  },
                  "邀请"
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
                        this.followDiscuss(params.row);
                      },
                    },
                  },
                  "关注"
                ),
              ]
            );
          },
        },
      ],
      addPostCommentForm: {
        uid: '',
        pid: 0,
        type: 1,
        toUid: '',
        postId: 0,
        content: '',
        receiverUid: 0,
      },
      replyForm: {
        title: '',
        topicId: 0,
        type: 1,
        media: [],
        longitude: 0,
        latitude: 0,
        address: '',
        discussId: 0,
        description: '',
        cut: [],
      },
      uidOfPost: '',
      idOfPost: 0,
      receiverUidOfPost: 0,
    };
  },
  methods: {
    callbackSelected(val) {
      this.picModelFlag = false;
      this.formValidate.media.push(val.url);
    },
    removeImage(index) {
      this.formValidate.media.splice(index, 1);
    },
    handleSubmit() {
      this.formValidate.uid = this.id;
      console.log("等待传输", JSON.parse(JSON.stringify(this.formValidate)));
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          API_Robot.addANewPost(this.formValidate).then((res) => {
            if (res) {
              this.$refs.formValidate.resetFields();
              this.formValidate.media = [];
              this.$Message.success("添加成功");
            } else {
              this.$Message.error('添加失败');
            }
          }).catch((error) => {
            console.error('提交错误:', error);
            this.$Message.error('网络错误，请稍后再试');
          });
        } else {
          this.$Message.warning('请检查表单内容是否填写完整');
        }
      });
    },
    handleDicussSubmit() {
      this.form.uid = this.id;
      console.log("等待传输", JSON.parse(JSON.stringify(this.form)));
      this.$refs.form.validate((valid) => {
        if (valid) {
          API_Robot.addANewDisscuss(this.form).then((res) => {
            if (res) {
              this.$refs.form.resetFields();
              this.$Message.success("添加成功");
            } else {
              this.$Message.error('添加失败');
            }
          }).catch((error) => {
            console.error('提交错误:', error);
            this.$Message.error('网络错误，请稍后再试');
          });
        } else {
          this.$Message.warning('请检查表单内容是否填写完整');
        }
      });
    },
    handleReset() {
      console.log(this.formValidate);
      this.$refs.formValidate.resetFields();
      this.formValidate.media = [];
      this.$Message.info('想法已重置');
    },
    handleDiscussReset() {
      console.log(this.form);
      this.$refs.form.resetFields();
      this.$Message.info('话题已重置');
    },
    init() {
      this.getRobotInfo();
      this.getPostList();
      this.getDiscussList();
      this.fetchCategories();
    },
    // 信息初始化
    getRobotInfo() {
      API_Robot.getRobotInfoData(this.id).then((res) => {
        this.$set(this, "memberInfo", res.result);
      });
    },
    // 查询机器人基本信息
    fetchCategories() {
      API_Category.getCategories()
        .then(res => {
          if (res.result) {
            this.categories = res.result;
            // 数组
          } else {
            this.$Message.error('获取分类失败');
          }
        })
        .catch(error => {
          console.error('获取分类错误:', error);
          this.$Message.error('网络错误，请稍后再试');
        });
    },
    robotOperationChange(v) {
      if (v === "point") {
      }
      if (v === "address") {
      }
      if (v === "order") {
      }
      if (v === "wallet") {
      }
    },
    getPostList() {
      this.loading = false;
      getPostListData(this.searchFormPost).then((res) => {
        this.loading = false;
        this.initData(res.result.records);
        this.postTotal = res.result.total;
      });
      this.loading = true;
    },
    getDiscussList() {
      this.loading = false;
      getDiscussListData(this.searchFormDiscuss).then((res) => {
        this.loading = false;
        this.initDiscussData(res.result.records);
        this.discussTotal = res.result.total;
      });
      this.loading = true;
    },
    changePagePost(v) {
      this.searchFormPost.pageNumber = v;
      this.getPostList();
    },
    changePageSizePost(v) {
      this.searchFormPost.pageSize = v;
      this.getPostList();
    },
    changePageDiscuss(v) {
      this.searchFormDiscuss.pageNumber = v;
      this.getDiscussList();
    },
    changePageSizeDiscuss(v) {
      this.searchFormDiscuss.pageSize = v;
      this.getDiscussList();
    },
    initData(data) {
      this.postData = data;
    },
    initDiscussData(data) {
      this.discussData = data;
    },
    thumbPost(v) {
      let addPostThumbForm = {
        id: v.id,
        uid: v.uid,
        thumbUid: this.id,
      }
      addPostThumb(addPostThumbForm).then((res) => {
        this.$Message.success("点赞成功");
      })
    },
    collectionPost(v) {
      let addPostCollectionForm = {
        id: v.id,
        uid: v.uid,
        thumbUid: this.id,
      }
      addPostCollection(addPostCollectionForm).then((res) => {
        this.$Message.success("收藏成功");
      })
    },
    handleComment() {
      this.addPostCommentForm.uid = this.uidOfPost;
      this.addPostCommentForm.postId = this.idOfPost;
      this.addPostCommentForm.receiverUid = this.receiverUidOfPost;
      console.log(this.addPostCommentForm);
      console.log(this.$refs.addPostCommentForm);
      addPostComment(this.addPostCommentForm).then((res) => {
        console.log(this.$refs.addPostCommentForm);
        this.addPostCommentForm.content = '';
        // this.$refs.addPostCommentForm.resetFields();
        this.$Message.success("评论成功");
        this.commentFlag = false;
      })
    },
    commentPost(v) {
      this.commentFlag = true;
      this.uidOfPost = this.memberInfo.id;
      this.idOfPost = v.id;
      this.receiverUidOfPost = v.uid;
      console.log(this.memberInfo);
      console.log(this.uidOfPost);
      console.log(this.idOfPost);
      console.log(this.receiverUidOfPost);
    },
    replyDiscuss(v) {
      this.replyFlag = true;
    },
    handleReply() {
      this.replyFlag = false;
    }
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
