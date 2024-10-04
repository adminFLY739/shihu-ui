import {deleteRequest, getRequest, postRequest, putRequest} from "@/libs/axios";

// 添加租户
export const addTenantArea = (params) => {
  return postRequest(`/tenant/area`, params);
};
// 分页获取租户
export const getTenantArea = (params) => {
  return getRequest(`/tenant/area`, params);
};
// 编辑租户
export const updateTenantArea = (id, params) => {
  return putRequest(`/tenant/area/${id}`, params);
};
// 删除租户
export const delTenantArea = (ids) => {
  return deleteRequest(`/tenant/area/delete/${ids}`);
};
