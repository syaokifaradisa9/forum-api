const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();

    this.pool = pool;
    this.idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this.idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };

    const result = await this.pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }
}

module.exports = CommentRepositoryPostgres;
