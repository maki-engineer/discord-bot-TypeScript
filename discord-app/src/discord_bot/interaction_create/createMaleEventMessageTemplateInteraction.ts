import { CommandInteraction } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235menコマンド
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {CommandInteraction} interaction CommandInteractionクラス
 */
export default async (client: DiscordBotType, interaction: CommandInteraction) => {
  if (interaction.commandName !== '235men') return;

  const setTimeoutSec = 180_000;

  switch (interaction.user.id) {
    case client.userIdForUtatane:
      await interaction.reply({
        content:
          '235menコマンドを使用することで、毎月開催される235士官学校🌹の日程を決める文章を作成することが出来ます。コマンドを使用するときは、開催したい日程を**2～10個**、**半角数字のみ**で入力してください。\n\n235men 12 14 16 17',
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, setTimeoutSec);
      break;

    default:
      await interaction.reply({
        content:
          '235men コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。',
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, setTimeoutSec);
      break;
  }
};
