/* eslint-disable linebreak-style */

const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this.threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    return this.threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
