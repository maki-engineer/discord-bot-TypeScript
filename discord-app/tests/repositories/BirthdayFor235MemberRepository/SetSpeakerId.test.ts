process.env.NODE_ENV = 'unittest';

const BirthdayFor235MemberRepository =
  require('../../../repositories/BirthdayFor235MemberRepository').default;
const { BirthdayFor235Member, sequelize } = require('../../../models/index').default;

describe('正常系（setSpeakerId）', (): void => {
  let transaction: any;
  const targetUserId = '123456789';
  const setSpeakerId = '34';

  beforeEach(async (): Promise<void> => {
    transaction = await sequelize.transaction();
  });

  afterEach(async (): Promise<void> => {
    if (transaction) {
      await transaction.rollback();
    }
  });

  afterAll(async (): Promise<void> => {
    await sequelize.close();
  });

  test('入力したメンバーの user_id が登録されていた場合は speaker_id が正常に更新されること', async (): Promise<void> => {
    const dummyData = {
      name: 'テスト太郎',
      user_id: targetUserId,
      month: 5,
      date: 2,
    };

    await BirthdayFor235Member.create(dummyData, { transaction });

    let createData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(createData[0].speaker_id).not.toBe(Number(setSpeakerId));

    await BirthdayFor235MemberRepository.setSpeakerId(targetUserId, setSpeakerId, transaction);

    createData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(createData[0].speaker_id).toBe(Number(setSpeakerId));
  });

  test('もし入力したメンバーの user_id が登録されていなかった場合は更新されないこと', async (): Promise<void> => {
    const dummyData = {
      name: 'テスト太郎',
      user_id: '987654321',
      month: 5,
      date: 2,
    };

    await BirthdayFor235Member.create(dummyData, { transaction });

    let createData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(createData[0].speaker_id).not.toBe(Number(setSpeakerId));

    await BirthdayFor235MemberRepository.setSpeakerId(targetUserId, setSpeakerId, transaction);

    createData = await BirthdayFor235Member.findAll({
      raw: true,
      transaction,
    });

    expect(createData[0].speaker_id).not.toBe(Number(setSpeakerId));
  });
});

export {};
