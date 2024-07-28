process.env.NODE_ENV = 'unittest';

const { DeleteMessage, sequelize } = require('../../../models/index');

describe('正常系（DeleteMessage.storeMessage）', (): void => {
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

  test('雑談場（通話外）チャンネルで投稿されたメッセージが保存された場合は、オブジェクトが返ること', async (): Promise < void > => {
    const insertMessageId = '123456789';
    const insertDate = 14;

    let deleteMessageData: [] | {
      message_id: string,
      date: number,
    }[] = await DeleteMessage.findAll({
      raw: true,
      transaction,
    });

    expect(deleteMessageData).toHaveLength(0);

    const result: { message_id: string, date: number } = await DeleteMessage.storeMessage(
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
