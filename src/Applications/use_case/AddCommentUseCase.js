const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this.commentRepository = commentRepository;
    this.threadRepository = threadRepository;
  }

  async execute({ content, threadId, owner }) {
    const newComment = new NewComment({ content, threadId, owner });

    await this.threadRepository.verifyThreadAvailableStatus(threadId);
    return this.commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
