import fs from 'fs';
import { VoiceState } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import VoiceVox from '../../voice_vox/VoiceVox';

/**
 * 235botが入っているボイスチャンネルに235プロダクションメンバーが参加した場合に、
 * 誰が参加したのかを235botがお知らせ
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {VoiceVox} voiceVox VoiceVoxクラス
 * @param {VoiceState} stateMember VoiceStateクラス
 */
export default async (client: DiscordBotType, voiceVox: VoiceVox, stateMember: VoiceState) => {
  // 退出タイミング or 235botがボイスチャンネルに参加していない場合
  if (stateMember.channelId !== null || client.connection === undefined) return;

  const joinedVoiceChannelMember = await stateMember.guild.members.fetch(stateMember.id);
  const joinedVoiceChannelId = joinedVoiceChannelMember.voice.channel!.id;

  // 235botがいるボイスチャンネルじゃなかった or botが参加してきた場合
  if (
    joinedVoiceChannelMember.user.bot === true ||
    joinedVoiceChannelId !== client.connection.joinConfig.channelId
  ) {
    return;
  }

  const announceVoiceList = [
    `${joinedVoiceChannelMember.user.globalName!}さんが来ました！`,
    `${joinedVoiceChannelMember.user.globalName!}さんが現れた！！`,
    `やっほ～！！${joinedVoiceChannelMember.user.globalName!}さんに挨拶しましょう！`,
    `${joinedVoiceChannelMember.user.globalName!}さん、どうもです！！`,
  ];

  const announceVoice = announceVoiceList[Math.floor(Math.random() * announceVoiceList.length)];

  const filePath = './data/voice';
  const wavFile = `${filePath}/${stateMember.id}.wav`;

  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

  let readText = VoiceVox.formatMessage(announceVoice);
  readText = await VoiceVox.replaceWord(readText);

  await VoiceVox.generateAudioFile(readText, wavFile, client.speakerId);

  voiceVox.addWavFileToQueue(wavFile);
};
