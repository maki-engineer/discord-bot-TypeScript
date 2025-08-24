import { Transaction } from 'sequelize';
import DictWordRepository from '../../../repositories/DictWordRepository';
import db from '../../../models/index';

const { DictWord, sequelize } = db;

describe('正常系（getDictWordList）', () => {
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

  test('単語辞書に登録されている単語が配列で返ること', async () => {
    const dummyData = [
      { word: '235', how_to_read: 'フミコ' },
      { word: 'test', how_to_read: 'テスト' },
    ];

    await DictWord.bulkCreate(dummyData, { transaction });

    const result = await DictWordRepository.getDictWordList(transaction);

    expect(result).toHaveLength(2);
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toBeInstanceOf(Object);
    expect(result).toEqual([dummyData[0], dummyData[1]]);
  });

  test('単語辞書に単語が登録されていなかった場合は、空配列が返ること', async () => {
    const result = await DictWordRepository.getDictWordList();

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

export {};
