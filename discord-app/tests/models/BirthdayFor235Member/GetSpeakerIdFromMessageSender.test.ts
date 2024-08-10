process.env.NODE_ENV = 'unittest';
const { BirthdayFor235Member, sequelize } = require('../../../models/index').default;

describe('正常系（BirthdayFor235Member.getSpeakerIdFromMessageSender）', (): void => {
  let transaction: any;
  const targetUserId = '123456789';

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

  test('テキストを読み上げる対象のチャンネルにテキストを入力した235プロダクションメンバーの speaker_id が返ること', async (): Promise < void > => {
    const targetSpeakerId = 62;

    const dummyData = [
      {
        name: 'テスト太郎', user_id: '123456789', month: 5, date: 2, speaker_id: targetSpeakerId,
      },
      {
        name: '佐藤テスト', user_id: '2233445566', month: 9, date: 4, speaker_id: 12,
      },
      {
        name: '山田テスト', user_id: '987654321', month: 12, date: 25, speaker_id: 34,
      },
    ];

    await BirthdayFor235Member.bulkCreate(dummyData, { transaction });

    const result: string = await BirthdayFor235Member.getSpeakerIdFromMessageSender(
      targetUserId,
      transaction,
    );

    expect(result).toBe(targetSpeakerId);
  });

  test('もし入力したメンバーの user_id が登録されていなくて見つからなかった場合は null が返ること', async (): Promise < void > => {
    const result: null = await BirthdayFor235Member.getSpeakerIdFromMessageSender(
      targetUserId,
      transaction,
    );

    expect(result).toBeNull();
  });
});

export {};
