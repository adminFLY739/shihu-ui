import {commonUrl, getRequest, uploadFileRequest, uploadFile, getRequestWithNoToken} from "@/libs/axios";

// 通过id获取子地区
export const getChildRegion = (id) => {
  return getRequest(`${commonUrl}/common/common/region/item/${id}`);
};

// 点地图获取地址信息
export const getRegion = (params) => {
  return getRequest(`${commonUrl}/common/common/region/region`, params);
};

// 获取IM接口前缀
export function getIMDetail() {
  return getRequest(`${commonUrl}/common/common/IM`);
}

//获取图片logo
export function getBaseSite() {
  return getRequest(`${commonUrl}/common/common/site`);
}

// 上传文件
export const upLoadFileMethods = (bold) => {
  console.log(bold)
  return uploadFileRequest(uploadFile, bold);
};

/**
 * 发送短信验证码
 */
export function sendSms (params) {
  return getRequest(`${commonUrl}/common/common/sms/${params.verificationEnums}/${params.mobile}`,params);
}

// 获取验证码
export const getCodeImg = () => {
  return getRequestWithNoToken(`${commonUrl}/common/common/getCodeImage`);
};

