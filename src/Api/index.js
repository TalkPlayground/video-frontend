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
  "https://gzqfuyrtlltxdjsgybam.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cWZ1eXJ0bGx0eGRqc2d5YmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY1ODM4MzcxMCwiZXhwIjoxOTczOTU5NzEwfQ.WOxkL0DcTw8QlHZC4yX8xRnPTZ-nb14muHYXDsJpuAE"
);
