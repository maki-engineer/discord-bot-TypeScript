import { Transaction } from 'sequelize';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';
import db from '../../../models/index';

const { BirthdayFor235Member, sequelize } = db;

describe('正常系（registNew235MemberBirthday）', () => {
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

  test('新しく235プロダクションに参加したメンバーの誕生日が保存された場合は、オブジェクトが返ること', async () => {
    const insertUserName = 'テスト太郎';
    const insertUserId = '123456789';
    const insertMonth = 4;
    const insertDate = 3;

    let birthdayFor235MemberData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(birthdayFor235MemberData).toHaveLength(0);

    const result = await BirthdayFor235MemberRepository.registNew235MemberBirthday(
      insertUserName,
      insertUserId,
      insertMonth,
      insertDate,
      transaction,
    );

    birthdayFor235MemberData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(birthdayFor235MemberData).toHaveLength(1);
    expect(result).toBeInstanceOf(Object);
    expect(birthdayFor235MemberData[0].name).toBe(result.name);
    expect(birthdayFor235MemberData[0].user_id).toBe(result.user_id);
    expect(birthdayFor235MemberData[0].month).toBe(result.month);
    expect(birthdayFor235MemberData[0].date).toBe(result.date);
  });
});

export {};
