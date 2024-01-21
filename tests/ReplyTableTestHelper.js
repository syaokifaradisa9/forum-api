/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const ReplyTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'abc',
    commentId = 'comment-123',
    owner = 'user-123',
    date = '2024-01-01',
    isdelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, content, commentId, owner, date, isdelete],
    };

    await pool.query(query);
    return id;
  },

  async getReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies where id=$1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = ReplyTableTestHelper;
