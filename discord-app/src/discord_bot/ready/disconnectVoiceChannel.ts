import { AudioPlayerStatus } from '@discordjs/voice';
import fs from 'fs';
import VoiceVox from '../../voice_vox/VoiceVox';
import { DiscordBotType } from '../DiscordBotType';
import getTodayDateList from './getTodayDateList';

/**
 * 235botが停止する5分前にボイスチャンネルにいた場合はアナウンスして退出する
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {VoiceVox} voiceVox VoiceVoxクラス
 */
export default async (client: DiscordBotType, voiceVox: VoiceVox) => {
  if (client.connection === undefined) return;

  const todayDateList = getTodayDateList();

  const disconnectVoice = `ぴんぽんぱんぽーん！もうすぐふみこぼっとが休憩時間に入るのでボイスチャンネルから退出します！${todayDateList.todayHour + 1}時30分頃になったらまたお呼びください！ばいちゃ！`;

  const filePath = './data/voice';
  const wavFile = `${filePath}/${client.userIdForMaki}.wav`;

  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

  await VoiceVox.generateAudioFile(disconnectVoice, wavFile, client.speakerId);

  voiceVox.playDisconnectAnnounce(wavFile);

  // @memo AudioPlayer.once メソッドはあるが、TypeScriptの型定義には存在していないのが原因でESLint によるエラーが起こっているため、ここだけ型チェックを無視
  // @ts-ignore
  client.audioPlayer.once(AudioPlayerStatus.Idle, () => {
    client.connection!.destroy();
    client.connection = undefined;
  });
};
