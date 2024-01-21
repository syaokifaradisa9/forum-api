/* eslint-disable no-undef */

const NewComment = require('../NewComment');

describe('a NewComment Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: '123',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 'abc',
      threadId: 123,
      owner: [],
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newComment object correctly', () => {
    const payload = {
      content: 'abcdefg',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const { content, threadId, owner } = new NewComment(payload);

    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
    expect(owner).toEqual(payload.owner);
  });
});
