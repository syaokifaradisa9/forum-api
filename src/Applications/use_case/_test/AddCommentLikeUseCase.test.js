/* eslint-disable no-undef */

const NewCommentLike = require('../../../Domains/comment_like/entities/NewCommentLike');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentLikeUseCase = require('../AddCommentLikeUseCase');
const CommentLikeRepository = require('../../../Domains/comment_like/CommentLikeRepository');

describe('AddCommentLikeUseCase', () => {
  it('should orchestrating the like comment correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockNewCommentLike = new NewCommentLike({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadAvailableStatus = jest.fn(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentAvailableStatus = jest.fn(() => Promise.resolve());

    const mockCommentLikeRepository = new CommentLikeRepository();
    mockCommentLikeRepository.getAlreadyLikeCommentStatus = jest.fn(() => Promise.resolve(false));
    mockCommentLikeRepository.likeComment = jest.fn(() => Promise.resolve());

    const addCommentUseCase = new AddCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await addCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadAvailableStatus)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentAvailableStatus)
      .toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentLikeRepository.getAlreadyLikeCommentStatus)
      .toBeCalledWith(mockNewCommentLike);
    expect(mockCommentLikeRepository.likeComment)
      .toBeCalledWith(mockNewCommentLike);
  });

  it('should orchestrating unlike comment correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockNewCommentLike = new NewCommentLike({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadAvailableStatus = jest.fn(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentAvailableStatus = jest.fn(() => Promise.resolve());

    const mockCommentLikeRepository = new CommentLikeRepository();
    mockCommentLikeRepository.getAlreadyLikeCommentStatus = jest.fn(() => Promise.resolve(true));
    mockCommentLikeRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const addCommentUseCase = new AddCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await addCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadAvailableStatus)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentAvailableStatus)
      .toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentLikeRepository.getAlreadyLikeCommentStatus)
      .toBeCalledWith(mockNewCommentLike);
    expect(mockCommentLikeRepository.unlikeComment)
      .toBeCalledWith(mockNewCommentLike);
  });
});
