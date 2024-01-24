const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.putThreadCommentLikeStatusHandler,
    options: {
      auth: 'forum_jwt',
    },
  },
]);

module.exports = routes;
