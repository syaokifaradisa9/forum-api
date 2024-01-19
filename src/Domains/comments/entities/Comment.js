class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDelete,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.isDelete = isDelete;
  }

  _verifyPayload({
    id, username, date, content, isDelete,
  }) {
    if (!id || !username || !date || !content) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
        || typeof date !== 'string'
        || typeof content !== 'string'
        || typeof content !== 'string'
        || typeof isDelete !== 'boolean') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;