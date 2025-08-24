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
 * @param {VoiceState} oldStateMember VoiceStateクラス
 * @param {VoiceState} newStateMember VoiceStateクラス
 */
export default async (
  client: DiscordBotType,
  voiceVox: VoiceVox,
  oldStateMember: VoiceState,
  newStateMember: VoiceState,
) => {
  // 退出タイミングだった場合
  if (oldStateMember.channelId !== null && newStateMember.channelId === null) return;
  // 235botがボイスチャンネルに参加していない場合
  if (client.connection === undefined) return;
  // 235botがいるボイスチャンネルじゃなかった場合
  if (newStateMember.channelId !== client.connection.joinConfig.channelId) return;
  // botが参加してきた場合
  if (newStateMember.member!.user.bot) return;

  const newStateMemberGlobalName = newStateMember.member!.user.globalName!;

  const announceVoiceList = [
    `${newStateMemberGlobalName}さんが来ました！`,
    `${newStateMemberGlobalName}さんが現れた！！`,
    `やっほ～！！${newStateMemberGlobalName}さんに挨拶しましょう！`,
    `${newStateMemberGlobalName}さん、どうもです！！`,
  ];

  const announceVoice = announceVoiceList[Math.floor(Math.random() * announceVoiceList.length)];

  const filePath = './data/voice';
  const wavFile = `${filePath}/${newStateMember.id}.wav`;

  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

  let readText = VoiceVox.formatMessage(announceVoice);
  readText = await VoiceVox.replaceWord(readText);

  await VoiceVox.generateAudioFile(readText, wavFile, client.speakerId);

  voiceVox.addWavFileToQueue(wavFile);
};
