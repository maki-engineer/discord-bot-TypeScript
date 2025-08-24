import { Transaction } from 'sequelize';
import DictWordRepository from '../../../repositories/DictWordRepository';
import db from '../../../models/index';

const { DictWord, sequelize } = db;

describe('正常系（updateReadOfWordToDict）', () => {
  let transaction: Transaction;
  const targetWord = 'test';
  const setHowToRead = 'テスト';

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

  test('入力された単語が単語辞書に登録されていた場合は、正常に読み方が更新されること', async () => {
    const dummyData = {
      word: targetWord,
      how_to_read: 'ティーイ―エスティ―',
    };

    await DictWord.create(dummyData, { transaction });

    let dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).not.toBe(setHowToRead);

    await DictWordRepository.updateReadOfWordToDict(targetWord, setHowToRead, transaction);

    dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).toBe(setHowToRead);
  });

  test('入力された単語が単語辞書に登録されていなかった場合は、読み方が更新されないこと', async () => {
    const dummyData = {
      word: '235',
      how_to_read: 'フミコ',
    };

    await DictWord.create(dummyData, { transaction });

    let dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).not.toBe(setHowToRead);

    await DictWordRepository.updateReadOfWordToDict(targetWord, setHowToRead, transaction);

    dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).not.toBe(setHowToRead);
  });
});

export {};
