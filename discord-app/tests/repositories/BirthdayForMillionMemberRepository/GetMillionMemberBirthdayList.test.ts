import { Transaction } from 'sequelize';
import BirthdayForMillionMemberRepository from '../../../repositories/BirthdayForMillionMemberRepository';
import db from '../../../models/index';

const { BirthdayForMillionMember, sequelize } = db;

describe('正常系（getMillionMemberBirthdayList）', () => {
  let transaction: Transaction;
  const targetMonth = 5;
  const targetDate = 22;

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

  test('当日誕生日のミリオンメンバー一覧が配列で返ること', async () => {
    const dummyData = [
      {
        name: '双海亜美',
        month: targetMonth,
        date: targetDate,
        img: 'img/million-character/birthday/ami.jpg',
      },
      {
        name: '双海真美',
        month: targetMonth,
        date: targetDate,
        img: 'img/million-character/birthday/mami.jpg',
      },
      {
        name: '天海春香',
        month: 4,
        date: 3,
        img: 'img/million-character/birthday/haruka.jpg',
      },
    ];

    await BirthdayForMillionMember.bulkCreate(dummyData, { transaction });

    const result = await BirthdayForMillionMemberRepository.getMillionMemberBirthdayList(
      targetMonth,
      targetDate,
      transaction,
    );

    expect(result).toHaveLength(2);
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(Object);
    expect(result[0].name).toBe(dummyData[0].name);
    expect(result[0].month).toBe(targetMonth);
    expect(result[0].date).toBe(targetDate);
    expect(result[1].name).toBe(dummyData[1].name);
    expect(result[1].month).toBe(targetMonth);
    expect(result[1].date).toBe(targetDate);
    expect(result).toEqual([dummyData[0], dummyData[1]]);
  });

  test('当日誕生日のミリオンメンバーがいなかった場合は、空配列が返ること', async () => {
    const result = await BirthdayForMillionMemberRepository.getMillionMemberBirthdayList(
      targetMonth,
      targetDate,
      transaction,
    );

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
