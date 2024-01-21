/* eslint-disable no-undef */

const Comment = require('../Comment');

describe('a Comment entities', () => {
  it('should throw error when did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      content: 'abc',
    };

    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      content: 444,
      date: 123,
      isdelete: 22,
    };

    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment object correctly when comment not deleted', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      content: 'abc',
      date: '2024',
      isdelete: false,
    };

    const {
      id, username, content, date,
    } = new Comment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
  });

  it('should create Comment object correctly when comment id deleted', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      content: 'abc',
      date: '2024',
      isdelete: true,
    };

    const {
      id, username, content, date,
    } = new Comment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual('**komentar telah dihapus**');
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
  });
});
