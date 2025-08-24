import { Transaction } from 'sequelize';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';
import db from '../../../models/index';

const { BirthdayFor235Member, sequelize } = db;

describe('正常系（setSpeakerId）', () => {
  let transaction: Transaction;
  const targetUserId = '123456789';
  const setSpeakerId = 34;

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

  test('入力したメンバーの user_id が登録されていた場合は speaker_id が正常に更新されること', async () => {
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

  test('もし入力したメンバーの user_id が登録されていなかった場合は更新されないこと', async () => {
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
