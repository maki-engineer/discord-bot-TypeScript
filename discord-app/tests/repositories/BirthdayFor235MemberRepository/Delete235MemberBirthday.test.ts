import { Transaction } from 'sequelize';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';
import db from '../../../models/index';

const { BirthdayFor235Member, sequelize } = db;

describe('正常系（delete235MemberBirthday）', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await sequelize!.transaction();
  });

  afterEach(async () => {
    if (transaction) {
      await transaction.rollback();
    }
  });

  afterAll(async () => {
    await sequelize!.close();
  });

  test('235プロダクションから退出したメンバーの誕生日が削除された場合は、削除された数が返ること', async () => {
    const deleteUserId = '123456789';

    await BirthdayFor235Member.create(
      {
        name: 'テスト太郎',
        user_id: deleteUserId,
        month: 4,
        date: 3,
      },
      {
        transaction,
      },
    );

    let birthdayFor235MemberData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(birthdayFor235MemberData).toHaveLength(1);
    expect(birthdayFor235MemberData[0].user_id).toBe(deleteUserId);

    const result: number = await BirthdayFor235MemberRepository.delete235MemberBirthday(
      deleteUserId,
      transaction,
    );

    birthdayFor235MemberData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(birthdayFor235MemberData).toHaveLength(0);
    expect(result).toBe(1);
  });
});

export {};
