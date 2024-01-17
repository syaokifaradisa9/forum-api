const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
  it('should throw error when did not contain needed property', () => {
    const payload = {
      content: 'abc',
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type spesification', () => {
    const payload = {
      content: 123,
      id: [],
      owner: {},
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPESIFICATION');
  });

  it('should create addedComment object correctly', () => {
    const payload = {
      content: 'abc',
      id: 'comment-123',
      owner: 'user-123',
    };

    const { id, content, owner } = new AddedComment(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content),
    expect(owner).toEqual(payload.owner);
  });
});
