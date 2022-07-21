const { createProxyMiddleware } = require("http-proxy-middleware");

const proxy = {
  target: "https://meet.talkplayground.com",
  changeOrigin: true,
};

// const proxy2 = {
//   target: "https://www.stackoverflow.com",
//   changeOrigin: true,
// };

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://meet.talkplayground.com",
      changeOrigin: true,
    })
  );

  // app.use(
  //   "/",
  //   createProxyMiddleware({
  //     target: "https://api.zoom.us/v2",
  //     changeOrigin: true,
  //   })
  // );
};
