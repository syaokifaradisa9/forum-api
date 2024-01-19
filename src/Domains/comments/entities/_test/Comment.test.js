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
      isDelete: 22,
    };

    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment object correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-123',
      content: 'abc',
      date: '2024',
      isDelete: false,
    };

    const {
      id, username, content, date, is_delete: isDelete,
    } = new Comment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(isDelete).toEqual(payload.is_delete);
  });
});
