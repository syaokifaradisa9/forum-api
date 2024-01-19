const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
  }

  async postThreadCommentHandler(request, h) {
    const { threadId } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute({ content, threadId, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = ThreadHandler;
