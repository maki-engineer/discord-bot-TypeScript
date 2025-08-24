import { CommandInteraction } from 'discord.js';

/**
 * 235roomdivisionコマンド
 *
 * @param {CommandInteraction} interaction CommandInteractionクラス
 */
export default async (interaction: CommandInteraction) => {
  if (interaction.commandName !== '235roomdivision') return;

  const setTimeoutSec = 180_000;

  await interaction.reply({
    content:
      '235roomdivisionコマンドを使用することで、【雑談１】ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、【雑談１】ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、【雑談１】ボイスチャンネルに参加しているメンバーのみが使用できます。',
    ephemeral: true,
  });

  setTimeout(() => {
    interaction.deleteReply().catch(() => {});
  }, setTimeoutSec);
};
