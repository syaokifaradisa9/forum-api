/* eslint-disable no-undef */

const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply correctly', async () => {
    // Arrange
    const requestPayload = {
      id: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyReplyAvailableStatus = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(requestPayload);

    // Assert
    expect(mockReplyRepository.verifyReplyAvailableStatus).toBeCalledWith(requestPayload.id);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(requestPayload);
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(requestPayload.id);
  });
});
