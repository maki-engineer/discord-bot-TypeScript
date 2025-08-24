import { Transaction } from 'sequelize';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';
import db from '../../../models/index';

const { BirthdayFor235Member, sequelize } = db;

describe('正常系（getSpeakerIdFromMessageSender）', () => {
  let transaction: Transaction;
  const targetUserId = '123456789';

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

  test('テキストを読み上げる対象のチャンネルにテキストを入力した235プロダクションメンバーの speaker_id が返ること', async () => {
    const targetSpeakerId = 62;

    const dummyData = [
      {
        name: 'テスト太郎',
        user_id: '123456789',
        month: 5,
        date: 2,
        speaker_id: targetSpeakerId,
      },
      {
        name: '佐藤テスト',
        user_id: '2233445566',
        month: 9,
        date: 4,
        speaker_id: 12,
      },
      {
        name: '山田テスト',
        user_id: '987654321',
        month: 12,
        date: 25,
        speaker_id: 34,
      },
    ];

    await BirthdayFor235Member.bulkCreate(dummyData, { transaction });

    const result = await BirthdayFor235MemberRepository.getSpeakerIdFromMessageSender(
      targetUserId,
      transaction,
    );

    expect(result).toBe(targetSpeakerId);
  });

  test('もし入力したメンバーの user_id が登録されていなくて見つからなかった場合は null が返ること', async () => {
    const result = await BirthdayFor235MemberRepository.getSpeakerIdFromMessageSender(
      targetUserId,
      transaction,
    );

    expect(result).toBeNull();
  });
});

export {};
