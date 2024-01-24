const CommentLikeRepository = require('../../Domains/comment_like/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();

    this.pool = pool;
    this.idGenerator = idGenerator;
  }

  async getAlreadyLikeCommentStatus({ commentId, owner }) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id=$1 AND owner=$2',
      values: [commentId, owner],
    };

    const result = await this.pool.query(query);
    return result.rowCount > 0;
  }

  async likeComment({ commentId, owner }) {
    const id = `like-${this.idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    await this.pool.query(query);
  }

  async unlikeComment({ commentId, owner }) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id=$1 AND owner=$2',
      values: [commentId, owner],
    };

    await this.pool.query(query);
  }

  async getLikeCountByThreadId(threadId) {
    const query = {
      text: `
        SELECT * FROM comment_likes
        INNER JOIN comments ON comment_likes.comment_id = comments.id
        WHERE comments.thread_id=$1
      `,
      values: [threadId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }
}

module.exports = CommentLikeRepositoryPostgres;
