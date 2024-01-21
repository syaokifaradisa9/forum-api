class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
    this.replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this.threadRepository.getThreadById(threadId);
    const comments = await this.commentRepository.getCommentsByThreadId(threadId);
    const replies = await this.replyRepository.getRepliesByThreadId(threadId);

    for (let i = 0; i < comments.length; i += 1) {
      const commentId = comments[i].id;
      comments[i].replies = replies.filter((reply) => reply.commentId === commentId);
    }

    thread.comments = comments;
    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
