
import {getRequest, postRequest, putRequest} from "@/libs/axios";


// 新增卡券
export const addCard = (params) => {
  return postRequest('/card/card', params, { 'Content-type': 'application/json' })
}

// 获取卡券券列表
export const getCardList = (params) => {
  return getRequest('/card/card', params)
}

//  获取单个卡券
export const getCard = (id) => {
  return getRequest(`/card/card/${id}`)
}
// 修改优惠券
export const editCard = (params) => {
  return putRequest('/card/card', params, { 'Content-type': 'application/json' })
}

//  更新优惠券状态
export const updateCardStatus = (params) => {
  return putRequest(`/card/card/status`, params)
}

// 获取提货码列表
export const getDeliveryList = (params) => {
  return getRequest('/card/delivery', params)
}

// 获取卡券券列表
export const getStoreAllCardList = (params) => {
  return getRequest('/card/card/all', params)
}

// 新增卡券
export const addDelivery= (params) => {
  return postRequest('/card/delivery', params, { 'Content-type': 'application/json' })
}

//  更新提货码状态
export const updateDeliveryStatus = (params) => {
  return putRequest(`/card/delivery/status`, params)
}
// 获取卡券券列表
export const getStoreCardOrderList = (params) => {
  return getRequest('/card/cardOrder', params)
}


