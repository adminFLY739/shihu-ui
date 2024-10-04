// 统一请求路径前缀在libs/axios.js中修改
import {deleteRequest, getRequest, postRequest, putRequest} from '@/libs/axios';

//分页查询实体店分类
export const getManagerPhyStoreCategoryPage = (params) => {
  return getRequest('/phy_store/category/getByPage', params)
}

//获取所有分类列表数据
export const getPhyStoreCategory = () => {
  return getRequest(`/phy_store/category/all`)
}
//  添加实体店分类
export const addPhyStoreCategory = (params) => {
  return postRequest('/phy_store/category', params)
}

// 批量删除
export const delPhyStoreCategory = (ids) =>{
  return deleteRequest(`/phy_store/category/delByIds/${ids}`)
}

export const disablePhyStoreCategory = (id, params) => {
  return putRequest(`/phy_store/category/disable/${id}`, params)
}
// 修改品牌设置
export const updatePhyStoreCategory = (params) => {
  return putRequest(`/phy_store/category/${params.id}`, params)
}

//查询实体店铺列表
export const getPhyShopListData = (params) => {
  return getRequest('/phy_store/phy_store', params)
}

//增加实体店铺列表
export const phyShopAdd = (params) => {
  return postRequest(`/phy_store/phy_store/add`, params)
}

//修改店铺列表
export const phyShopEdit = (id,params) => {
  return putRequest(`/phy_store/phy_store/edit/${id}`, params)
}

//查询店铺详情
export const phyShopDetail = (id) => {
  return getRequest(`/phy_store/phy_store/get/detail/${id}`)
}

//查询店铺详细
export const getPhyShopDetailData = (id, params) => {
  return getRequest(`/phy_store/phy_store/get/detail/${id}`, params)
}

//禁用店铺
export const disablePhyShop = (id) => {
  return putRequest(`/phy_store/phy_store/disable/${id}`)
}

//开启店铺
export const enablePhyShop  = (id) => {
  return putRequest(`/phy_store/phy_store/enable/${id}`)
}

//审核店铺
export const phyShopAudit = (id, passed) => {
  return putRequest(`/phy_store/phy_store/audit/${id}/${passed}`)
}







