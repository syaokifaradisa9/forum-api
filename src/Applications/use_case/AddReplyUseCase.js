const NewReply = require('../../Domains/replies/Entities/NewReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
    this.replyRepository = replyRepository;
  }

  async execute({
    threadId, commentId, owner, content,
  }) {
    await this.threadRepository.verifyThreadAvailableStatus(threadId);
    await this.commentRepository.verifyCommentAvailableStatus(commentId);

    const newReplyPayload = new NewReply({
      commentId,
      owner,
      content,
    });

    return this.replyRepository.addReply(newReplyPayload);
  }
}

module.exports = AddReplyUseCase;
