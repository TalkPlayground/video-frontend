import axios from "axios";

export const baseURL = "/base";

// "proxy": "https://meet.talkplayground.com",

export const Apis = {
  Register: "api/v1/user/register",
  Login: "/v1/user/login",
  JoinSession: "/v1/user/session/join",
};

export const getQueryString = (params) => {
  let query = Object.keys(params).filter(
    (key) =>
      params[key] !== undefined && params[key] !== null && params[key] !== ""
  );
  return query.map((key) => key + "=" + params[key]).join("&");
};
