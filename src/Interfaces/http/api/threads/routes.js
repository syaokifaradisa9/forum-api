const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'threadapp_jwt',
    },
  },
]);

module.exports = routes;
