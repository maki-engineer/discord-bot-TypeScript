process.env.NODE_ENV = 'unittest';
const { BirthdayFor235Member, sequelize } = require('../../../models/index').default;

describe('正常系（BirthdayFor235Member.getThisMonthBirthdayMember）', (): void => {
  let transaction: any;
  const targetMonth = 4;

  beforeEach(async (): Promise < void > => {
    transaction = await sequelize.transaction();
  });

  afterEach(async (): Promise < void > => {
    if (transaction) {
      await transaction.rollback();
    }
  });

  afterAll(async (): Promise < void > => {
    await sequelize.close();
  });

  test('今月誕生日の235プロダクションメンバー一覧が配列で返ること', async (): Promise < void > => {
    const dummyData = [
      {
        name: 'テスト太郎', user_id: '123456789', month: targetMonth, date: 2, speaker_id: 62,
      },
      {
        name: '佐藤テスト', user_id: '2233445566', month: targetMonth, date: 4, speaker_id: 62,
      },
      {
        name: '山田テスト', user_id: '987654321', month: 12, date: 25, speaker_id: 62,
      },
    ];

    await BirthdayFor235Member.bulkCreate(dummyData, { transaction });

    const result: {
      name: string,
      user_id: string,
      month: number,
      date: number,
      speaker_id: number,
    }[] = await BirthdayFor235Member.getThisMonthBirthdayMember(
      targetMonth,
      transaction,
    );

    expect(result).toHaveLength(2);
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(Object);
    expect(result[0].month).toBe(targetMonth);
    expect(result[1].month).toBe(targetMonth);
    expect(result).toEqual([
      dummyData[0],
      dummyData[1],
    ]);
  });

  test('今月誕生日の235プロダクションメンバー一覧が昇順で返ること', async (): Promise < void > => {
    const dummyData = [
      {
        name: 'テスト太郎', user_id: '123456789', month: targetMonth, date: 13,
      },
      {
        name: '佐藤テスト', user_id: '2233445566', month: targetMonth, date: 29,
      },
      {
        name: '山田テスト', user_id: '987654321', month: targetMonth, date: 4,
      },
    ];

    await BirthdayFor235Member.bulkCreate(dummyData, { transaction });

    const result: {
      name: string,
      user_id: string,
      month: number,
      date: number,
    }[] = await BirthdayFor235Member.getThisMonthBirthdayMember(
      targetMonth,
      transaction,
    );

    expect([
      result[0].date,
      result[1].date,
      result[2].date,
    ]).toEqual([
      dummyData[2].date,
      dummyData[0].date,
      dummyData[1].date,
    ]);
  });

  test('今月誕生日の235プロダクションメンバーがいなかった場合は、空配列が返ること', async (): Promise < void > => {
    const result: [] = await BirthdayFor235Member.getThisMonthBirthdayMember(
      targetMonth,
      transaction,
    );

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
