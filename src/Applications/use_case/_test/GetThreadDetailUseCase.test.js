/* eslint-disable no-undef */

const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentLikeRepository = require('../../../Domains/comment_like/CommentLikeRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread detail correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const username = 'syaokifaradisa09';
    const firstCommentId = 'comment-123';
    const secondCommentId = 'comment-456';
    const firstReplyId = 'reply-123';
    const secondReplyId = 'reply-456';
    const content = 'abc';

    const date = new Date();
    const firstCommentDate = date.toISOString();

    date.setHours(date.getHours() + 1);
    const secondCommentDate = date.toISOString();

    date.setHours(date.getHours() + 2);
    const firstReply1Date = date.toISOString();

    date.setHours(date.getHours() + 3);
    const secondReplyDate = date.toISOString();

    const useCasePayload = {
      threadId,
    };

    const thread = {
      id: threadId,
      title: 'thread title',
      body: 'body thread',
      date: 'date thread',
      username,
    };

    const comments = [
      {
        id: firstCommentId,
        username,
        date: firstCommentDate,
        content,
        isdelete: false,
      },
      {
        id: secondCommentId,
        username,
        date: secondCommentDate,
        content,
        isdelete: false,
      },
    ];

    const replies = [
      {
        id: firstReplyId,
        content,
        date: firstReply1Date,
        username,
        isdelete: false,
        commentId: firstCommentId,
      },
      {
        id: secondReplyId,
        content,
        date: secondReplyDate,
        username,
        isdelete: true,
        commentId: secondCommentId,
      },
    ];

    const commentLikes = [
      {
        id: 'like-123',
        comment_id: 'comment-123',
      },
      {
        id: 'like-456',
        comment_id: 'comment-123',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(thread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(comments));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve(replies));

    const mockCommentLikeRepository = new CommentLikeRepository();
    mockCommentLikeRepository.getLikeCountByThreadId = jest.fn(() => Promise.resolve(commentLikes));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(threadDetail).toEqual({
      id: thread.id,
      title: thread.title,
      date: thread.date,
      body: thread.body,
      username: thread.username,
      comments: [
        {
          id: firstCommentId,
          username,
          date: firstCommentDate,
          content,
          isdelete: comments[0].isdelete,
          likeCount: commentLikes.filter((like) => like.comment_id === firstCommentId).length,
          replies: [
            replies[0],
          ],
        },
        {
          id: secondCommentId,
          username,
          date: secondCommentDate,
          content,
          isdelete: comments[1].isdelete,
          likeCount: commentLikes.filter((like) => like.comment_id === secondCommentId).length,
          replies: [
            replies[1],
          ],
        },
      ],
    });
  });
});
