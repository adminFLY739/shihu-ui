import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest, postRequestWithNoForm,
} from "@/libs/axios";
export const getCategories = (params) => {
  return getRequest("/bbs/topic/classList", params);
}
