class DeleteThreadCommentUseCase {
  constructor({ commentRepository }) {
    this.commentRepository = commentRepository;
  }

  async execute({ id, owner }) {
    await this.commentRepository.verifyCommentAvailableStatus(id);
    await this.commentRepository.verifyCommentOwner({ owner, id });

    await this.commentRepository.deleteCommentById(id);
  }
}

module.exports = DeleteThreadCommentUseCase;
