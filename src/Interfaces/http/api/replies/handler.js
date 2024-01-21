const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class ReplyHandler {
  constructor(container) {
    this._container = container;

    this.postReplyCommentHandler = this.postReplyCommentHandler.bind(this);
    this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
  }

  async postReplyCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      threadId, commentId, owner, content,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });

    response.code(201);
    return response;
  }

  async deleteReplyCommentHandler(request, h) {
    const { replyId } = request.params;
    const { id: owner } = request.auth.credentials;

    const deleteReplyCommentHandler = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyCommentHandler.execute({
      id: replyId,
      owner,
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus balasan komentar',
    });

    response.code(200);
    return response;
  }
}

module.exports = ReplyHandler;
