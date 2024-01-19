/* eslint-disable no-undef */

const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment correctly', async () => {
    const useCasePayload = {
      content: 'abc',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockAddeddComment = new AddedComment({
      content: 'abc',
      id: 'comment-123',
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddeddComment));

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadAvailableStatus = jest.fn(() => Promise.resolve());

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const addedComment = await addCommentUseCase.execute(useCasePayload);

    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: 'abc',
      owner: 'user-123',
    }));

    expect(mockCommentRepository.addComment).toBeCalledWith(new NewComment({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
  });
});
