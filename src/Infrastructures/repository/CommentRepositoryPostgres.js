const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');

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
        SELECT comments.id, comments.content, comments.date, comments.username, users.username
        FROM comments INNER JOIN users ON comments.owner = users.id
        WHERE comments.thread_id = $1,
      `,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows.map((comment) => new Comment({
      ...comment,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
