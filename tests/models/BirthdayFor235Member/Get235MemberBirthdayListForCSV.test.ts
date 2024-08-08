process.env.NODE_ENV = 'unittest';

require('dotenv').config();

const { BirthdayFor235Member, sequelize } = require('../../../models/index').default;

describe('正常系（BirthdayFor235Member.get235MemberBirthdayListForCSV）', (): void => {
  let transaction: any;

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

  test('CSV出力用の235プロダクションメンバー一覧が配列で返ること', async (): Promise < void > => {
    const dummyData = [
      {
        name: 'テスト太郎', user_id: '123456789', month: 1, date: 1,
      },
      {
        name: '佐藤テスト', user_id: '2233445566', month: 2, date: 4,
      },
      {
        name: '山田テスト', user_id: '987654321', month: 12, date: 25,
      },
    ];

    await BirthdayFor235Member.bulkCreate(dummyData, { transaction });

    const result: {
      name: string,
      month: number,
      date: number,
    }[] = await BirthdayFor235Member.get235MemberBirthdayListForCSV(transaction);

    expect(result).toHaveLength(3);
    expect(result[0]).toBeInstanceOf(Object);
    expect(Object.keys(result[0])).toEqual([
      'name',
      'month',
      'date',
    ]);
  });

  test('CSV出力用の235プロダクションメンバー一覧が昇順で返ること', async (): Promise < void > => {
    const dummyData = [
      {
        name: 'テスト太郎', user_id: '123456789', month: 8, date: 7,
      },
      {
        name: '佐藤テスト', user_id: '2233445566', month: 5, date: 24,
      },
      {
        name: '山田テスト', user_id: '987654321', month: 5, date: 15,
      },
    ];

    await BirthdayFor235Member.bulkCreate(dummyData, { transaction });

    const result: {
      name: string,
      month: number,
      date: number,
    }[] = await BirthdayFor235Member.get235MemberBirthdayListForCSV(transaction);

    expect([
      [result[0].month, result[0].date],
      [result[1].month, result[1].date],
      [result[2].month, result[2].date],
    ]).toEqual([
      [dummyData[1].month, dummyData[2].date],
      [dummyData[2].month, dummyData[1].date],
      [dummyData[0].month, dummyData[0].date],
    ]);
  });

  test('235プロダクションメンバーの誕生日リストのデータがない場合は、空配列が返ること', async (): Promise < void > => {
    const result: [] = await BirthdayFor235Member.get235MemberBirthdayListForCSV(transaction);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
