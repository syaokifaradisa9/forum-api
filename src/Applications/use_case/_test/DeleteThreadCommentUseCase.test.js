/* eslint-disable no-undef */

const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase');

describe('DeleteThreadCommentUseCase', () => {
  it('should orchestrating the delete comment correctly', async () => {
    // Arrange
    const requestPayload = {
      id: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentAvailableStatus = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteThreadCommentUseCase.execute(requestPayload);

    // Assert
    expect(mockCommentRepository.verifyCommentAvailableStatus).toBeCalledWith(requestPayload.id);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(requestPayload);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(requestPayload.id);
  });
});
