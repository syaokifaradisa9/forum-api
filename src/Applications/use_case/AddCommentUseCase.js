const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this.commentRepository = commentRepository;
    this.threadRepository = threadRepository;
  }

  async execute({ content, threadId, owner }) {
    await this.threadRepository.verifyThreadAvailableStatus(threadId);

    const newComment = new NewComment({ content, threadId, owner });
    return this.commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
