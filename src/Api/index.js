import { createClient } from "@supabase/supabase-js";
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

export const supabase = createClient(
  "https://lpenohbnnyugfldiqxtu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZW5vaGJubnl1Z2ZsZGlxeHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTg3MjE4OTksImV4cCI6MTk3NDI5Nzg5OX0.WGQG8bbLisvSdGhGjdIy0E5dQ8DZ1LVOkUK6Fxrz-jM"
);
