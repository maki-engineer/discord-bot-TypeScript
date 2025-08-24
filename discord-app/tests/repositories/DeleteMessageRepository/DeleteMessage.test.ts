import { Transaction } from 'sequelize';
import DeleteMessageRepository from '../../../repositories/DeleteMessageRepository';
import db from '../../../models/index';

const { DeleteMessage, sequelize } = db;

describe('正常系（deleteMessage）', () => {
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

  test('雑談場（通話外）チャンネルで投稿された1週間前のメッセージが削除された場合は、削除された数が返ること', async () => {
    const deleteMessageId = '123456789';

    await DeleteMessage.create(
      {
        message_id: deleteMessageId,
        date: 14,
      },
      {
        transaction,
      },
    );

    let deleteMessageData = await DeleteMessage.findAll({
      raw: true,
      transaction,
    });

    expect(deleteMessageData).toHaveLength(1);
    expect(deleteMessageData[0].message_id).toBe(deleteMessageId);

    const result = await DeleteMessageRepository.deleteMessage(deleteMessageId, transaction);

    deleteMessageData = await DeleteMessage.findAll({
      raw: true,
      transaction,
    });

    expect(deleteMessageData).toHaveLength(0);
    expect(result).toBe(1);
  });
});

export {};
