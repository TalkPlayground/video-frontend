import { getExploreName } from '../utils/platform';
const dotenv = require('dotenv').config()

export const devConfig = {
  sdkKey: process.env.REACT_APP_ZOOM_SDK_KEY,
  sdkSecret: process.env.REACT_APP_ZOOM_SDK_SECRET,
  topic: 'topic',
  // name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  name:"",
  password: 'pass',
  signature: '',
};
