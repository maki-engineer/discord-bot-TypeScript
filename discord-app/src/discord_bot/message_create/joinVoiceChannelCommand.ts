import fs from 'fs';
import { EmbedBuilder, Message, VoiceChannel } from 'discord.js';
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import { DiscordBotType } from '../DiscordBotType';
import VoiceVox from '../../voice_vox/VoiceVox';

/**
 * 235joinコマンド コマンドを入力したメンバーが入っているボイスチャンネルに参加
 *
 * @param {Message} message Messageクラス
 * @param {VoiceVox} voiceVox VoiceVoxクラス
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {string} commandName 入力されたコマンド名
 */
export default async (
  message: Message,
  voiceVox: VoiceVox,
  client: DiscordBotType,
  commandName: string,
) => {
  if (commandName !== 'join') return;

  const setTimeoutSec = 15_000;

  const usedCommandMember = await message.guild!.members.fetch(message.author.id);
  const memberJoinVoiceChannel = usedCommandMember.voice.channel! as VoiceChannel;

  if (
    client.connection !== undefined &&
    client.connection.joinConfig.channelId === memberJoinVoiceChannel.id
  ) {
    const embed = new EmbedBuilder()
      .setTitle('既に接続されています！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
      .setColor('#FF0000')
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  if (memberJoinVoiceChannel === null) {
    await message.reply(
      '235joinコマンドを使用することで、使用したメンバーが参加しているボイスチャンネルに235botが参加して、そのボイスチャンネルの聞き専チャンネルに投稿されたテキストを読み上げます！\nボイスチャンネルに参加してから再度このスラッシュコマンドを使用していただくか、もしくはテキストで「235join」と入力していただければボイスチャンネルに参加します！',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  if (!memberJoinVoiceChannel.joinable || !memberJoinVoiceChannel.speakable) {
    await message.reply(
      '参加先のボイスチャンネルに接続できなかったか、もしくは参加先のボイスチャンネルで音声を再生する権限がありませんでした；；',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  client.connection = joinVoiceChannel({
    channelId: memberJoinVoiceChannel.id,
    guildId: message.guild!.id,
    adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    selfMute: false,
    selfDeaf: true,
  });

  client.connection.subscribe(client.audioPlayer);

  const connectVoice =
    client.connectVoiceList[Math.floor(Math.random() * client.connectVoiceList.length)];

  const filePath = './data/voice';
  const wavFile = `${filePath}/${usedCommandMember.user.id}.wav`;

  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

  await VoiceVox.generateAudioFile(connectVoice, wavFile, client.speakerId);

  voiceVox.addWavFileToQueue(wavFile);

  const embed = new EmbedBuilder()
    .setTitle('接続されました！')
    .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
    .setColor('#00FF99')
    .setTimestamp();

  await message.reply({ embeds: [embed] });

  setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);
};
