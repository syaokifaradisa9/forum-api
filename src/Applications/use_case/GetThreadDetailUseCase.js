class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this.threadRepository.getThreadById(threadId);
    const comments = await this.commentRepository.getCommentsByThreadId(threadId);

    thread.comments = comments;
    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
