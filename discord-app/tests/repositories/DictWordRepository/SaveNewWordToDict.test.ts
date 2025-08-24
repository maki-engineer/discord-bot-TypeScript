import { Transaction } from 'sequelize';
import DictWordRepository from '../../../repositories/DictWordRepository';
import db from '../../../models/index';

const { DictWord, sequelize } = db;

describe('正常系（saveNewWordToDict）', () => {
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

  test('入力された単語が正常に単語辞書に追加された場合は、オブジェクトが返ること', async () => {
    const insertWord = 'test';
    const insertHowToRead = 'テスト';

    let dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData).toHaveLength(0);

    const result = await DictWordRepository.saveNewWordToDict(
      insertWord,
      insertHowToRead,
      transaction,
    );

    dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData).toHaveLength(1);
    expect(result).toBeInstanceOf(Object);
    expect(dictWordData[0].word).toBe(result.word);
    expect(dictWordData[0].how_to_read).toBe(result.how_to_read);
  });
});

export {};
