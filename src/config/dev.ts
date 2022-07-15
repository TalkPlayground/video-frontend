import { getExploreName } from '../utils/platform';
const dotenv = require('dotenv').config()

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
export const topicInfo = urlParams.get('topic')


export const devConfig = {
  sdkKey: process.env.REACT_APP_ZOOM_SDK_KEY,
  sdkSecret: process.env.REACT_APP_ZOOM_SDK_SECRET,
  topic: topicInfo ? `${topicInfo}` :`${create_UUID()}`,
  // name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  name:"",
  password: 'pass',
  signature: '',
};

function create_UUID(){
  var dt = new Date().getTime();
  var uuid = 'xxx-xxxx-4xx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

