const NewCommentLike = require('../../Domains/comment_like/entities/NewCommentLike');

class AddCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
    this.commentLikeRepository = commentLikeRepository;
  }

  async execute({ threadId, commentId, owner }) {
    await this.threadRepository.verifyThreadAvailableStatus(threadId);
    await this.commentRepository.verifyCommentAvailableStatus(commentId);

    const newCommentLike = new NewCommentLike({ commentId, owner });
    const isAlreadyLike = await this.commentLikeRepository.getAlreadyLikeCommentStatus(
      newCommentLike,
    );

    if (isAlreadyLike) {
      await this.commentLikeRepository.unlikeComment(newCommentLike);
    } else {
      await this.commentLikeRepository.likeComment(newCommentLike);
    }
  }
}

module.exports = AddCommentLikeUseCase;
