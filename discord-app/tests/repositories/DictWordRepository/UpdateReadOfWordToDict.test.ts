process.env.NODE_ENV = 'unittest';

require('dotenv').config();

const DictWordRepository = require('../../../repositories/DictWordRepository').default;
const { DictWord, sequelize } = require('../../../models/index').default;

describe('正常系（updateReadOfWordToDict）', (): void => {
  let transaction: any;
  const targetWord = 'test';
  const setHowToRead = 'テスト';

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

  test('入力された単語が単語辞書に登録されていた場合は、正常に読み方が更新されること', async (): Promise<void> => {
    const dummyData = {
      word: targetWord,
      how_to_read: 'ティーイ―エスティ―',
    };

    await DictWord.create(dummyData, { transaction });

    let dictWordData: {
      word: string;
      how_to_read: string;
    }[] = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).not.toBe(setHowToRead);

    await DictWordRepository.updateReadOfWordToDict(targetWord, setHowToRead, transaction);

    dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).toBe(setHowToRead);
  });

  test('入力された単語が単語辞書に登録されていなかった場合は、読み方が更新されないこと', async (): Promise<void> => {
    const dummyData = {
      word: '235',
      how_to_read: 'フミコ',
    };

    await DictWord.create(dummyData, { transaction });

    let dictWordData: {
      word: string;
      how_to_read: string;
    }[] = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).not.toBe(setHowToRead);

    await DictWordRepository.updateReadOfWordToDict(targetWord, setHowToRead, transaction);

    dictWordData = await DictWord.findAll({ raw: true, transaction });

    expect(dictWordData[0].how_to_read).not.toBe(setHowToRead);
  });
});

export {};
