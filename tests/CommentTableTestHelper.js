/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'abc',
    threadId = 'thread-123',
    owner = 'user-123',
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5)',
      values: [id, content, threadId, date, owner],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentTableTestHelper;
