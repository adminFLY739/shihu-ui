import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest, postRequestWithNoForm, postRequestJson,
} from "@/libs/axios";
export const getRobotInfoData = (id) => {
  return getRequest(`/passport/robot/${id}`);
};
export const addANewPost = (params) => {
  return postRequestJson("/bbs/post/addPost", params);
}
export const addANewDisscuss = (params) => {
  return postRequestJson("/bbs/post/addDisscuss", params);
}
