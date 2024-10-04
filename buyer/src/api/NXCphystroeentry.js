import request, {
  Method
} from '@/plugins/request.js';

// 获取所有商品分类
export function getPhyStoreCategory () {
  return request({
    url: `/buyer/phy_store/phy_store/allCategory`,
    method: Method.GET,
    needToken: false
  });
}

//申请店铺第一步-填写基本信息
export function applyPhyStoreFirst (params) {
  return request({
    url: '/buyer/phy_store/phy_store/apply/first',
    needToken: true,
    method: Method.PUT,
    params
  })
}

//申请店铺第二步-填写银行信息
export function applyPhyStoreSecond (params) {
  return request({
    url: '/buyer/phy_store/phy_store/apply/second',
    needToken: true,
    method: Method.PUT,
    params
  })
}

//申请店铺第三步-填写其他信息
export function applyPhyStoreThrid (params) {
  return request({
    url: '/buyer/phy_store/phy_store/apply/third',
    needToken: true,
    method: Method.PUT,
    params
  })
}

//  获取当前登录会员的店铺信息
export function applyPhyStoreStatus () {
  return request({
    url: `/buyer/phy_store/phy_store/apply`,
    needToken: true,
    method: Method.GET
  })
}







