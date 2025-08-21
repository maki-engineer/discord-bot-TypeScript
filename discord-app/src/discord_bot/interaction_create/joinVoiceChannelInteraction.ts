import fs from 'fs';
import { ChatInputCommandInteraction, EmbedBuilder, VoiceChannel } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { DiscordBotType } from '../DiscordBotType';
import VoiceVox from '../../voice_vox/VoiceVox';

/**
 * 235joinコマンド
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {VoiceVox} voiceVox VoiceVoxクラス
 * @param {ChatInputCommandInteraction} interaction ChatInputCommandInteractionクラス
 */
export default async (
  client: DiscordBotType,
  voiceVox: VoiceVox,
  interaction: ChatInputCommandInteraction,
) => {
  if (interaction.commandName !== '235join') return;

  const setTimeoutSec = 180_000;
  const usedCommandMember = await interaction.guild!.members.fetch(interaction.user.id);
  const memberJoinVoiceChannel = usedCommandMember.voice.channel;

  if (
    client.connection !== undefined &&
    client.connection.joinConfig.channelId === memberJoinVoiceChannel!.id
  ) {
    const embed = new EmbedBuilder()
      .setTitle('既に接続されています！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel!.name })
      .setColor('#FF0000')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, setTimeoutSec);

    return;
  }

  if (memberJoinVoiceChannel === null) {
    await interaction.reply(
      '235joinコマンドを使用することで、使用したメンバーが参加しているボイスチャンネルに235botが参加して、そのボイスチャンネルの聞き専チャンネルに投稿されたテキストを読み上げます！\nボイスチャンネルに参加してから再度このスラッシュコマンドを使用していただくか、もしくはテキストで「235join」と入力していただければボイスチャンネルに参加します！',
    );

    return;
  }

  if (!memberJoinVoiceChannel.joinable || !(memberJoinVoiceChannel as VoiceChannel).speakable) {
    await interaction.reply(
      '参加先のボイスチャンネルに接続できなかったか、もしくは参加先のボイスチャンネルで音声を再生する権限がありませんでした；；',
    );

    return;
  }

  client.connection = joinVoiceChannel({
    channelId: memberJoinVoiceChannel.id,
    guildId: interaction.guild!.id,
    adapterCreator: interaction.guild!.voiceAdapterCreator,
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

  await interaction.reply({ embeds: [embed] });

  setTimeout(() => {
    interaction.deleteReply().catch(() => {});
  }, setTimeoutSec);
};
