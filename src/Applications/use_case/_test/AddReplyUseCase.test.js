/* eslint-disable no-undef */

const AddedReply = require('../../../Domains/replies/Entities/AddedReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/Entities/NewReply');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply correctly', async () => {
    // Arrange
    const replyId = 'reply-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';
    const content = 'abc';

    const requestPayload = {
      threadId,
      commentId,
      owner,
      content,
    };

    const expectedAddedReply = new AddedReply({
      id: replyId,
      owner,
      content,
    });

    const mockAddeddReply = new AddedReply({
      id: replyId,
      owner,
      content,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadAvailableStatus = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentAvailableStatus = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddeddReply));

    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(requestPayload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadAvailableStatus).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentAvailableStatus).toBeCalledWith(commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new NewReply({
      commentId,
      owner,
      content,
    }));
  });
});
