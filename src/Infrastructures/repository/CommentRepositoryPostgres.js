const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();

    this.pool = pool;
    this.idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this.idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, threadId, date, owner],
    };

    const result = await this.pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(id) {
    const query = {
      text: `
        SELECT comments.*, users.username
        FROM comments INNER JOIN users ON comments.owner = users.id
        WHERE comments.thread_id = $1 ORDER BY comments.date ASC
      `,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows.map((comment) => new Comment({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.content,
      isdelete: comment.isdelete,
    }));
  }

  async verifyCommentOwner({ id, owner }) {
    const query = {
      text: 'SELECT id, owner FROM comments WHERE id=$1 AND owner=$2',
      values: [id, owner],
    };

    const result = await this.pool.query(query);
    console.log(id, owner, result);
    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak memiliki akses ke komentar ini');
    }
  }

  async verifyCommentAvailableStatus(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id=$1',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Data komentar tidak ditemukan');
    }
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET isdelete=$1 WHERE id=$2',
      values: [true, id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Penghapusan gagal, data tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
