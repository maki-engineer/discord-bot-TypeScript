process.env.NODE_ENV = 'unittest';

require('dotenv').config();

const { DictWord, sequelize } = require('../../../models/index').default;

describe('正常系（DictWord.saveNewWordToDict）', (): void => {
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

  test('入力された単語が正常に単語辞書に追加された場合は、オブジェクトが返ること', async (): Promise < void > => {
    const insertWord = 'test';
    const insertHowToRead = 'テスト';

    let dictWordData: [] | {
      word: string,
      how_to_read: string,
    }[] = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData).toHaveLength(0);

    const result: {
      word: string,
      how_to_read: string,
    } = await DictWord.saveNewWordToDict(insertWord, insertHowToRead, transaction);

    dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData).toHaveLength(1);
    expect(result).toBeInstanceOf(Object);
    expect(dictWordData[0].word).toBe(result.word);
    expect(dictWordData[0].how_to_read).toBe(result.how_to_read);
  });
});

export {};
