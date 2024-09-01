process.env.NODE_ENV = 'unittest';

require('dotenv').config();

const { DictWord, sequelize } = require('../../../models/index').default;

describe('正常系（DictWord.getDictWordList）', (): void => {
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

  test('単語辞書に登録されている単語が配列で返ること', async (): Promise < void > => {
    const dummyData = [
      { word: '235', how_to_read: 'フミコ' },
      { word: 'test', how_to_read: 'テスト' },
    ];

    await DictWord.bulkCreate(dummyData, { transaction });

    const result: {
      word: string,
      how_to_read: string,
    }[] = await DictWord.getDictWordList(transaction);

    expect(result).toHaveLength(2);
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(Object);
    expect(result).toEqual([
      dummyData[0],
      dummyData[1],
    ]);
  });

  test('単語辞書に単語が登録されていなかった場合は、空配列が返ること', async (): Promise < void > => {
    const result: [] = await DictWord.getDictWordList();

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
