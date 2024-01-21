/* eslint-disable no-undef */

const NewReply = require('../NewReply');

describe('a NewReply Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'abc',
      commentId: 'comment-123',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did meet data type specification', () => {
    const payload = {
      content: 'abc',
      commentId: 123,
      owner: 123,
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    const payload = {
      content: 'abc',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const { content, commentId, owner } = new NewReply(payload);

    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
