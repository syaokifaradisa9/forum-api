const AddCommentLikeUseCase = require('../../../../Applications/use_case/AddCommentLikeUseCase');

class CommentLikeHandler {
  constructor(container) {
    this._container = container;
    this.putThreadCommentLikeStatusHandler = this.putThreadCommentLikeStatusHandler.bind(this);
  }

  async putThreadCommentLikeStatusHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;

    const addCommentLikeUseCase = this._container.getInstance(AddCommentLikeUseCase.name);
    await addCommentLikeUseCase.execute({ threadId, commentId, owner });

    const response = h.response({
      status: 'success',
    });

    response.code(200);
    return response;
  }
}

module.exports = CommentLikeHandler;
