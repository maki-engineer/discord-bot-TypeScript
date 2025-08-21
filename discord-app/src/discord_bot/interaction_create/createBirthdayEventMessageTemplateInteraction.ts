import { CommandInteraction } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235birthdayコマンド
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {CommandInteraction} interaction CommandInteractionクラス
 */
export default async (client: DiscordBotType, interaction: CommandInteraction) => {
  if (interaction.commandName !== '235birthday') return;

  const setTimeoutSec = 180_000;

  switch (interaction.user.id) {
    case client.userIdForUtatane:
      await interaction.reply({
        content:
          '235birthdayコマンドを使用することで、毎月開催されるオンライン飲み会の企画文章を作成することが出来ます。コマンドを使用するときは、開催したい月、日程、時間の**3つ**を**半角数字のみ**、**半角スペースで区切って**入力してください。\n\n235birthday 12 14 21',
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, setTimeoutSec);
      break;

    default:
      await interaction.reply({
        content:
          '235birthday コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。',
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, setTimeoutSec);
      break;
  }
};
