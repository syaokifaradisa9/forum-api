const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this.threadRepository = threadRepository;
  }

  async execute({ title, body, owner }) {
    const newThread = new NewThread({ title, body, owner });
    return this.threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
