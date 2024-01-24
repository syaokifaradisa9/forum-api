class GetThreadDetailUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, commentLikeRepository,
  }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
    this.replyRepository = replyRepository;
    this.commentLikeRepository = commentLikeRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this.threadRepository.getThreadById(threadId);
    const comments = await this.commentRepository.getCommentsByThreadId(threadId);
    const replies = await this.replyRepository.getRepliesByThreadId(threadId);
    const commentLikes = await this.commentLikeRepository.getLikeCountByThreadId(threadId);

    for (let i = 0; i < comments.length; i += 1) {
      const commentId = comments[i].id;
      comments[i].replies = replies.filter((reply) => reply.commentId === commentId);
      comments[i].likeCount = commentLikes.filter((like) => like.comment_id === commentId).length;
    }

    thread.comments = comments;
    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
