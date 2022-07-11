import { getExploreName } from '../utils/platform';
const { v4: uuidv4 } = require("uuid");
const dotenv = require('dotenv').config()

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
export const topicInfo = urlParams.get('topic')


export const devConfig = {
  sdkKey: process.env.REACT_APP_ZOOM_SDK_KEY,
  sdkSecret: process.env.REACT_APP_ZOOM_SDK_SECRET,
  topic: topicInfo ? `${topicInfo}` :`${uuidv4()}`,
  // name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  name:topicInfo  ? `${getExploreName()}-${Math.floor(Math.random() * 1000)}` :"",
  password: 'pass',
  signature: '',
};
