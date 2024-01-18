const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

const pool = require('../../database/postgres/pool');

const NewThread = require('../../../Domains/threads/entities/NewThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should return added comment correctly', async () => {
      const fakeIdGenerator = () => '123';

      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      await userRepositoryPostgres.addUser(registerUser);

      const newThread = new NewThread({
        title: 'abc',
        body: 'abcdef',
        owner: 'user-123',
      });
      await threadRepositoryPostgres.addThread(newThread);

      const newComment = new NewComment({
        content: 'abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const addComment = await commentRepositoryPostgres.addComment(newComment);

      expect(addComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'abc',
        owner: 'user-123',
      }));
    });
  });
});
