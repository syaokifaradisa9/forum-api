const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this.commentRepository = commentRepository;
  }

  async execute({ content, threadId, owner }) {
    const newComment = new NewComment({ content, threadId, owner });
    return this.commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
