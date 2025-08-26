import fs from 'fs';
import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';
import VoiceVox from '../../voice_vox/VoiceVox';

/**
 * テキストを読み上げる
 *
 * @param {Message} message Messageクラス
 * @param {VoiceVox} voiceVox VoiceVoxクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, voiceVox: VoiceVox, client: DiscordBotType) => {
  if (client.connection === undefined) return;

  const formatMessageList = message.content.split(' ');
  const commandList = client.commandList.map((command) => command.name);

  if (commandList.includes(formatMessageList[0])) return;

  const readChannelIdList = [client.connection.joinConfig.channelId];

  const readTextChannelList = [
    {
      voiceChannelId: client.voiceChannelIdFor235ChatPlace,
      channelId: client.channelIdFor235ListenOnly,
    },
    {
      voiceChannelId: client.voiceChannelIdFor235ChatPlace2,
      channelId: client.channelIdFor235ListenOnly2,
    },
    {
      voiceChannelId: client.voiceChannelIdForGame,
      channelId: client.channelIdForGameListenOnly,
    },
  ];

  const sentChannelId = readTextChannelList.find((data) => {
    return data.voiceChannelId === client.connection!.joinConfig.channelId;
  });

  if (sentChannelId !== undefined) {
    readChannelIdList.push(sentChannelId.channelId);
  }

  if (!readChannelIdList.includes(message.channelId)) return;

  const filePath = './data/voice';
  const wavFile = `${filePath}/${message.author.id}.wav`;

  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

  const speakerIdExists = await BirthdayFor235MemberRepository.getSpeakerIdFromMessageSender(
    message.author.id,
  );

  const speakerId = speakerIdExists ?? client.speakerId;

  let readText: string = VoiceVox.formatMessage(message.content);
  readText = await VoiceVox.replaceWord(readText);

  await VoiceVox.generateAudioFile(readText, wavFile, String(speakerId));

  voiceVox.addWavFileToQueue(wavFile);
};
