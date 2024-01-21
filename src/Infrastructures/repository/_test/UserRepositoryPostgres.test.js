/* eslint-disable no-undef */

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const pool = require('../../database/postgres/pool');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyAvailableUsername function', () => {
    it('should throw InvariantError when username not available', async () => {
      // Arrange
      const username = 'syaokifaradisa';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ username });

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername(username))
        .rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError when username available', async () => {
      // Arrange
      const username = 'syaokifaradisa09';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername(username))
        .resolves.not.toThrowError(InvariantError);
    });
  });

  describe('addUser function', () => {
    it('should persist register user and return registered user correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const fakeIdGenerator = () => '123';
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      const users = await UsersTableTestHelper.findUsersById(userId);

      // Assert
      expect(users).toHaveLength(1);
    });

    it('should return registered user correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const username = 'syaokifaradisa09';
      const fullname = 'Muhammad Syaoki Faradisa';
      const fakeIdGenerator = () => '123'; // stub!
      const registerUser = new RegisterUser({
        username,
        password: 'secret_password',
        fullname,
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: userId,
        username,
        fullname,
      }));
    });
  });

  describe('getPasswordByUsername', () => {
    it('should throw InvariantError when user not found', () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(userRepositoryPostgres.getPasswordByUsername('dicoding'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return username password when user is found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
      });

      // Action & Assert
      const password = await userRepositoryPostgres.getPasswordByUsername('dicoding');
      expect(password).toBe('secret_password');
    });
  });

  describe('getIdByUsername', () => {
    it('should throw InvariantError when user not found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.getIdByUsername('dicoding'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return user id correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const userId = await userRepositoryPostgres.getIdByUsername('dicoding');

      // Assert
      expect(userId).toEqual('user-321');
    });
  });
});
