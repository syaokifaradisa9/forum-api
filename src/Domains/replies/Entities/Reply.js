class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, isdelete, commentId,
    } = payload;

    this.id = id;
    this.content = isdelete ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.username = username;
    this.commentId = commentId;
  }

  _verifyPayload({
    id, content, date, username, isdelete, commentId,
  }) {
    if (!id || !content || !date || !username || !commentId) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof isdelete !== 'boolean'
      || typeof commentId !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
