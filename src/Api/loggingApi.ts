import axios from 'axios';

declare interface logFormat {
  type: string;
  content: string;
}
export const logServerUrl = 'https://logging-server-452ae05abf59.herokuapp.com/';

export const postLog = async (message: logFormat) => {
  try {
    await axios.post(logServerUrl + 'log', { message });
  } catch (error) {
    console.log(error);
  }
};
