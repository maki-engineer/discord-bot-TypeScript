import { Transaction } from 'sequelize';
import DeleteMessageRepository from '../../../repositories/DeleteMessageRepository';
import db from '../../../models/index';

const { DeleteMessage, sequelize } = db;

describe('正常系（storeMessage）', () => {
  let transaction: Transaction;

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

  test('雑談場（通話外）チャンネルで投稿されたメッセージが保存された場合は、オブジェクトが返ること', async () => {
    const insertMessageId = '123456789';
    const insertDate = 14;

    let deleteMessageData = await DeleteMessage.findAll({
      raw: true,
      transaction,
    });

    expect(deleteMessageData).toHaveLength(0);

    const result = await DeleteMessageRepository.storeMessage(
      insertMessageId,
      insertDate,
      transaction,
    );

    deleteMessageData = await DeleteMessage.findAll({
      raw: true,
      transaction,
    });

    expect(deleteMessageData).toHaveLength(1);
    expect(result).toBeInstanceOf(Object);
    expect(deleteMessageData[0].message_id).toBe(result.message_id);
    expect(deleteMessageData[0].date).toBe(result.date);
  });
});

export {};
