import { EmbedBuilder, Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235disconnectコマンド 235botをボイスチャンネルから切断
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {string} commandName 入力されたコマンド名
 */
export default async (message: Message, client: DiscordBotType, commandName: string) => {
  if (commandName !== 'disconnect') return;

  const setTimeoutSec = 15_000;

  const usedCommandMember = await message.guild!.members.fetch(message.author.id);
  const memberJoinVoiceChannel = usedCommandMember.voice.channel;

  if (client.connection === undefined) {
    const embed = new EmbedBuilder()
      .setTitle('まだボイスチャンネルに接続されていません！')
      .setColor('#FF0000')
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

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

    await message.reply({ embeds: [embed] });

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  client.connection.destroy();
  client.connection = undefined;

  const embed = new EmbedBuilder()
    .setTitle('切断されました！')
    .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
    .setColor('#00FF99')
    .setTimestamp();

  await message.reply({ embeds: [embed] });

  setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);
};
