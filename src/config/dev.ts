import { getExploreName } from '../utils/platform';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
export const topicInfo = urlParams.get('topic');

export const devConfig = {
  sdkKey: 'ibquuO2GGD6DjvtP4p2yGC8CcGGlMl72nMJ4',
  sdkSecret: 'Xv55BmmlKxAxFiB7rKQNb4u2fT7sNPmTKfnc',
  webEndpoint: 'zoom.us',
  topic: topicInfo ? `${topicInfo}` : `${create_UUID()}`,
  name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  password: '',
  signature: '',
  sessionKey: '',
  userIdentity: '',
  // role = 1 to join as host, 0 to join as attendee. The first user must join as host to start the session
  role: 1
};

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxx-xxxx-4xx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

export const logServerUrl = 'https://logging-server-452ae05abf59.herokuapp.com/log';
