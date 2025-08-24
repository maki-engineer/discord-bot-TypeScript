import { Transaction } from 'sequelize';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';
import db from '../../../models/index';

const { BirthdayFor235Member, sequelize } = db;

describe('正常系（get235MemberBirthdayList）', () => {
  let transaction: Transaction;
  const exclusionUserId = process.env.USER_ID_FOR_MAKI!;
  const targetMonth = 4;
  const targetDate = 3;

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

  test('当日誕生日の235プロダクションメンバー一覧が配列で返ること', async () => {
    const dummyData = [
      {
        name: 'テスト太郎',
        user_id: '123456789',
        month: targetMonth,
        date: targetDate,
        speaker_id: 62,
      },
      {
        name: '佐藤テスト',
        user_id: '2233445566',
        month: targetMonth,
        date: targetDate,
        speaker_id: 62,
      },
      {
        name: '山田テスト',
        user_id: '987654321',
        month: 12,
        date: 25,
        speaker_id: 62,
      },
    ];

    await BirthdayFor235Member.bulkCreate(dummyData, { transaction });

    const result = await BirthdayFor235MemberRepository.get235MemberBirthdayList(
      exclusionUserId,
      targetMonth,
      targetDate,
      transaction,
    );

    expect(result).toHaveLength(2);
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(Object);
    expect(result[0].month).toBe(targetMonth);
    expect(result[0].date).toBe(targetDate);
    expect(result[1].month).toBe(targetMonth);
    expect(result[1].date).toBe(targetDate);
    expect(result).toEqual([dummyData[0], dummyData[1]]);
  });

  test('特定のメンバーの誕生日は取得されないこと', async () => {
    await BirthdayFor235Member.create(
      {
        name: 'テスト太郎',
        user_id: exclusionUserId,
        month: targetMonth,
        date: targetDate,
      },
      {
        transaction,
      },
    );

    const result = await BirthdayFor235MemberRepository.get235MemberBirthdayList(
      exclusionUserId,
      targetMonth,
      targetDate,
      transaction,
    );

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  test('当日誕生日の235プロダクションメンバーがいなかった場合は、空配列が返ること', async () => {
    const result = await BirthdayFor235MemberRepository.get235MemberBirthdayList(
      exclusionUserId,
      targetMonth,
      targetDate,
      transaction,
    );

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
