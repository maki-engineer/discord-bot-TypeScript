import { Transaction } from 'sequelize';
import DeleteMessageRepository from '../../../repositories/DeleteMessageRepository';
import db from '../../../models/index';

const { DeleteMessage, sequelize } = db;

describe('正常系（findDeleteMessages）', () => {
  let transaction: Transaction;
  const targetDate = 14;

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

  test('1週間前に投稿されたメッセージ一覧が配列で返ること', async () => {
    const dummyData = [
      {
        message_id: '123456789',
        date: targetDate,
      },
      {
        message_id: '987654321',
        date: targetDate,
      },
      {
        message_id: '334455667788',
        date: 25,
      },
    ];

    await DeleteMessage.bulkCreate(dummyData, { transaction });

    const result = await DeleteMessageRepository.findDeleteMessages(targetDate, transaction);

    expect(result).toHaveLength(2);
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(Object);
    expect(result[0].message_id).toBe(dummyData[0].message_id);
    expect(result[0].date).toBe(targetDate);
    expect(result[1].message_id).toBe(dummyData[1].message_id);
    expect(result[1].date).toBe(targetDate);
    expect(result).toEqual([dummyData[0], dummyData[1]]);
  });

  test('削除対象のメッセージが見つからなかった場合は、空配列が返ること', async () => {
    const result = await DeleteMessageRepository.findDeleteMessages(targetDate, transaction);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
