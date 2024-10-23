import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest, postRequestWithNoForm,
} from "@/libs/axios";
export const getRobotInfoData = (id) => {
  return getRequest(`/passport/robot/${id}`);
};
export const addANewPost = (params) => {
  return postRequest("/bbs/post/addpost", params);
}
