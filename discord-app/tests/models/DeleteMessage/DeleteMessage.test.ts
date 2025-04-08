process.env.NODE_ENV = 'unittest';

const { DeleteMessage, sequelize } = require('../../../models/index').default;

describe('正常系（DeleteMessage.deleteMessage）', (): void => {
  let transaction: any;

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

  test('雑談場（通話外）チャンネルで投稿された1週間前のメッセージが削除された場合は、削除された数が返ること', async (): Promise<void> => {
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

    let deleteMessageData: {
      message_id: string;
      date: number;
    }[] = await DeleteMessage.findAll({
      raw: true,
      transaction,
    });

    expect(deleteMessageData).toHaveLength(1);
    expect(deleteMessageData[0].message_id).toBe(deleteMessageId);

    const result: number = await DeleteMessage.deleteMessage(deleteMessageId, transaction);

    deleteMessageData = await DeleteMessage.findAll({
      raw: true,
      transaction,
    });

    expect(deleteMessageData).toHaveLength(0);
    expect(result).toBe(1);
  });
});

export {};
