process.env.NODE_ENV = 'unittest';

const { BirthdayForMillionMember, sequelize } = require('../../../models/index');

describe('正常系（BirthdayForMillionMember.getMillionMemberBirthdayList）', (): void => {
  let transaction: any;
  const targetMonth = 5;
  const targetDate = 22;

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

  test('当日誕生日のミリオンメンバー一覧が配列で返ること', async (): Promise <void > => {
    const dummyData = [
      {
        name: '双海亜美', month: targetMonth, date: targetDate, img: 'img/million-character/birthday/ami.jpg',
      },
      {
        name: '双海真美', month: targetMonth, date: targetDate, img: 'img/million-character/birthday/mami.jpg',
      },
      {
        name: '天海春香', month: 4, date: 3, img: 'img/million-character/birthday/haruka.jpg',
      },
    ];

    await BirthdayForMillionMember.bulkCreate(dummyData, { transaction });

    const result: {
      name: string,
      month: number,
      date: number,
      img: string
    }[] = await BirthdayForMillionMember.getMillionMemberBirthdayList(
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
    expect(result).toEqual([
      dummyData[0],
      dummyData[1],
    ]);
  });

  test('当日誕生日のミリオンメンバーがいなかった場合は、空配列が返ること', async (): Promise < void > => {
    const result: {
      name: string,
      month: number,
      date: number,
      img: string
    }[] = await BirthdayForMillionMember.getMillionMemberBirthdayList(
      targetMonth,
      targetDate,
      transaction,
    );

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
