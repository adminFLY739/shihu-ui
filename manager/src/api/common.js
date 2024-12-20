import {commonUrl, getRequest, getRequestWithNoToken, postRequestWithNoToken,uploadFileRequest,uploadFile} from '@/libs/axios';

// 通过id获取子地区
export const getChildRegion = (id) => {
  return getRequest(`${commonUrl}/common/common/region/item/${id}`);
};

// 点地图获取地址信息
export const getRegion = (params) => {
  return getRequest(`${commonUrl}/common/common/region/region`, params);
};

// 获取系统基础信息
export const getBaseSite = () => {
  return getRequest(`${commonUrl}/common/common/site`);
};

// 上传文件
export const upLoadFile = (bold) =>{
  return uploadFileRequest(uploadFile,bold);
}
// 获取验证码
export const getCodeImg = () => {
  return getRequestWithNoToken(`${commonUrl}/common/common/getCodeImage`);
};
