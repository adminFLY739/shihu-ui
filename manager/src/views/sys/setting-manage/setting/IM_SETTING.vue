<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">
      <FormItem label="云IM地址" prop="httpUrl">
        <Input v-model="formValidate.httpUrl"/>
      </FormItem>
      <div class="label-btns">
        <Button type="primary" @click="submit('formValidate')">保存</Button>
      </div>
    </Form>
  </div>
</template>
<script>
import {setSetting} from "@/api/index";
import {handleSubmit} from "./validate";
import Cookies from "js-cookie";

export default {
  data() {
    return {
      ruleValidate: {}, // 验证规则
      formValidate: { // 表单数据
        httpUrl: ""
      },
      userInfo: JSON.parse(Cookies.get("userInfoManager")),
    };
  },
  props: ["res", "type"],
  created() {
    this.init();
  },
  methods: {
    // 保存
    submit(name) {
      let that = this;
      if (handleSubmit(that, name)) {
        this.setupSetting()
      }
    },
    // 保存设置
    setupSetting() {
      let tenantId;
      if(!this.userInfo.isSuper&&this.userInfo.tenantId){
        tenantId=this.userInfo.tenantId;
      }
      else{
        tenantId="0";
      }
      setSetting(this.type, this.formValidate,tenantId).then((res) => {
        if (res.success) {
          this.$Message.success("保存成功!");
        } else {
          this.$Message.error("保存失败!");
        }
      });
    },
    // 实例化数据
    init() {
      let data = JSON.parse(this.res);

      this.$set(this, "formValidate", {...data});
      Object.keys(this.formValidate).forEach((item) => {
        this.ruleValidate[item] = [
          {
            required: true,
            message: "请填写必填项",
            trigger: "blur",
          },
        ];
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./style.scss";

.label-item {
  display: flex;
}

/deep/ .ivu-input {
  width: 300px !important;
  margin: 0 10px;
}

.ivu-input-wrapper {
  width: 300px;
  margin-right: 10px;
}
</style>
