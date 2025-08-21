import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import DictWordRepository from '../../../repositories/DictWordRepository';

/**
 * 単語を辞書に登録
 * すでに登録されていた単語が指定されていた場合は更新するように
 *
 * @param {string} word 単語
 * @param {string} howToRead 読み方
 */
const registWord = async (word: string, howToRead: string) => {
  const dictWordList = await DictWordRepository.getDictWordList();

  const wordList = dictWordList.map(
    (dictWordData: { word: string; how_to_read: string }) => dictWordData.word,
  );

  // すでに登録されていたら更新
  if (wordList.includes(word)) {
    await DictWordRepository.updateReadOfWordToDict(word, howToRead);

    return;
  }

  await DictWordRepository.saveNewWordToDict(word, howToRead);
};

/**
 * 入力された単語と読み方を単語辞書に登録
 *
 * @param {ChatInputCommandInteraction} interaction ChatInputCommandInteractionクラス
 */
export default async (interaction: ChatInputCommandInteraction) => {
  if (interaction.commandName !== '235addword') return;

  const setTimeoutSec = 180_000;
  const word = interaction.options.getString('単語') as string;
  const howToRead = interaction.options.getString('読み方') as string;

  if (/^[ァ-ヶー]*$/.test(howToRead) === false) {
    const embed = new EmbedBuilder()
      .setTitle('辞書登録に失敗しました；；')
      .setDescription('読み方は全角カタカタのみで入力するようにする必要があります。')
      .setColor('#FF0000')
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, setTimeoutSec);

    return;
  }

  await registWord(word, howToRead);

  const embed = new EmbedBuilder()
    .setTitle('辞書に登録しました！')
    .addFields(
      { name: '単語', value: word, inline: true },
      { name: '読み方', value: howToRead, inline: true },
    )
    .setColor('#00FF99')
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });

  setTimeout(() => {
    interaction.deleteReply().catch(() => {});
  }, setTimeoutSec);
};
