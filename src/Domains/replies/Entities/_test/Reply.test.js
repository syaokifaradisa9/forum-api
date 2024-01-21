/* eslint-disable no-undef */

const Reply = require('../Reply');

describe('a Reply entities', () => {
  it('should throw error when did not contain needed property', () => {
    const payload = {
      content: 'abc',
    };

    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'abc',
      date: '01-01-2024',
      username: ['syaokifaradisa09'],
      isdelete: false,
      commentId: 'comment-123',
    };

    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply object correctly when reply not delete', () => {
    const payload = {
      id: 'reply-123',
      content: 'abc',
      date: '01-01-2024',
      username: 'syaokifaradisa09',
      isdelete: false,
      commentId: 'comment-123',
    };

    const {
      id, content, date, username, commentId,
    } = new Reply(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(commentId).toEqual(payload.commentId);
  });

  it('should create Reply object correctly when reply is deleted', () => {
    const payload = {
      id: 'reply-123',
      content: 'abc',
      date: '01-01-2024',
      username: 'syaokifaradisa09',
      isdelete: true,
      commentId: 'comment-123',
    };

    const {
      id, content, date, username, commentId,
    } = new Reply(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual('**balasan telah dihapus**');
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(commentId).toEqual(payload.commentId);
  });
});
