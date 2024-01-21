class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, isdelete,
    } = payload;

    this.id = id;
    this.content = isdelete ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload({
    id, content, date, username, isdelete,
  }) {
    if (!id || !content || !date || !username) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof isdelete !== 'boolean') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
