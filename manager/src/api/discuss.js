import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest, postRequestWithNoForm, postRequestJson,
} from "@/libs/axios";
export const getDiscussListData = (params) => {
  return getRequest('/discusses/list', params)
}
// export const addPostThumb = (params) => {
//   return postRequestJson('/bbs/post/addPostThumb', params)
// }
// export const addPostCollection = (params) => {
//   return postRequestJson('/bbs/post/addCollection', params)
// }
// export const addPostComment = (params) => {
//   return postRequestJson('/bbs/post/addManagerComment', params)
// }
