import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235disconnectコマンド
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {ChatInputCommandInteraction} interaction ChatInputCommandInteractionクラス
 *
 */
export default async (client: DiscordBotType, interaction: ChatInputCommandInteraction) => {
  if (interaction.commandName !== '235disconnect') return;

  const setTimeoutSec = 180_000;

  const usedCommandMember = await interaction.guild!.members.fetch(interaction.user.id);
  const memberJoinVoiceChannel = usedCommandMember.voice.channel;

  if (client.connection === undefined) {
    const embed = new EmbedBuilder()
      .setTitle('まだボイスチャンネルに接続されていません！')
      .setColor('#FF0000')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, setTimeoutSec);

    return;
  }

  if (
    memberJoinVoiceChannel === null ||
    client.connection.joinConfig.channelId !== memberJoinVoiceChannel.id
  ) {
    const embed = new EmbedBuilder()
      .setTitle('切断できるのは235botが入っているボイスチャンネルに参加しているメンバーだけです！')
      .setColor('#FFCC00')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, setTimeoutSec);

    return;
  }

  client.connection.destroy();
  client.connection = undefined;

  const embed = new EmbedBuilder()
    .setTitle('切断されました！')
    .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
    .setColor('#00FF99')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  setTimeout(() => {
    interaction.deleteReply().catch(() => {});
  }, setTimeoutSec);
};
