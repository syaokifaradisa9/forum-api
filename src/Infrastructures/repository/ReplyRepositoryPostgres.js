const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/Entities/AddedReply');
const Reply = require('../../Domains/replies/Entities/Reply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();

    this.pool = pool;
    this.idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this.idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, commentId, owner, date],
    };

    const result = await this.pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByCommentId(id) {
    const query = {
      text: `
        SELECT replies.*, users.username
        FROM replies INNER JOIN users ON replies.owner = users.id
        WHERE replies.comment_id = $1 ORDER BY replies.date ASC
    `,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows.map((reply) => new Reply({
      id: reply.id,
      content: reply.content,
      date: reply.date,
      username: reply.username,
      isdelete: reply.isdelete,
    }));
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET isdelete=$1 WHERE id=$2',
      values: [true, id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Data balasan komen tidak ditemukan');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
