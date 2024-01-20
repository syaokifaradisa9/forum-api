/* eslint-disable no-undef */

const Comment = require('../../../Domains/comments/entities/Comment');
const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread detail correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    // Arrange Thread
    const thread = new Thread({
      id: 'thread-123',
      title: 'thread title',
      body: 'body thread',
      date: 'date thread',
      username: 'syaokifaradisa',
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(thread));

    // Arrange Comment
    const date = new Date();
    const comment1Date = date.toISOString();
    date.setHours(date.getHours() + 1);
    const comment2Date = date.toISOString();

    const comments = [
      new Comment({
        id: 'comment-1',
        username: 'syaokifaradisa',
        date: comment1Date,
        content: 'comment 1',
        isDelete: false,
      }),
      new Comment({
        id: 'comment-2',
        username: 'syaokifaradisa',
        date: comment2Date,
        content: 'comment 2',
        isDelete: true,
      }),
    ];

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(threadDetail).toEqual({
      id: thread.id,
      title: thread.title,
      date: thread.date,
      body: thread.body,
      username: thread.username,
      comments: [
        {
          id: 'comment-1',
          username: 'syaokifaradisa',
          date: comment1Date,
          content: 'comment 1',
        },
        {
          id: 'comment-2',
          username: 'syaokifaradisa',
          date: comment2Date,
          content: '**komentar telah dihapus**',
        },
      ],
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
  });
});
