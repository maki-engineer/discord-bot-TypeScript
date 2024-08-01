process.env.NODE_ENV = 'unittest';

const { BirthdayFor235Member, sequelize } = require('../../../models/index').default;

describe('正常系（BirthdayFor235Member.registNew235MemberBirthday）', (): void => {
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

  test('新しく235プロダクションに参加したメンバーの誕生日が保存された場合は、オブジェクトが返ること', async (): Promise < void > => {
    const insertUserName = 'テスト太郎';
    const insertUserId = '123456789';
    const insertMonth = 4;
    const insertDate = 3;

    let birthdayFor235MemberData: [] | {
      name: string,
      user_id: string,
      month: number,
      date: number,
    }[] = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(birthdayFor235MemberData).toHaveLength(0);

    const result: {
      name: string,
      user_id: string,
      month: number,
      date: number,
    } = await BirthdayFor235Member.registNew235MemberBirthday(
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
