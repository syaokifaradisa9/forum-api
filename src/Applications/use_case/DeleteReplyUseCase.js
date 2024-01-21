class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this.replyRepository = replyRepository;
  }

  async execute({ id, owner }) {
    await this.replyRepository.verifyReplyAvailableStatus(id);
    await this.replyRepository.verifyReplyOwner({ owner, id });

    await this.replyRepository.deleteReplyById(id);
  }
}

module.exports = DeleteReplyUseCase;
