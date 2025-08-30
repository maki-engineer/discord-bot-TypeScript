import { Message, TextChannel } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import VoiceVox from '../../voice_vox/VoiceVox';
import Gemini from '../../gemini/Gemini';

/**
 * geminiを使って235bot宛に来た質問に対して回答文を生成
 *
 * @param {Message} message Messageクラス
 * @param {Gemini} gemini Geminiクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, gemini: Gemini, client: DiscordBotType) => {
  const userIdFor235Bot = process.env.USER_ID_FOR_235_BOT!;

  if (message.mentions.everyone || !message.mentions.has(userIdFor235Bot)) return;

  let formattedMessage = message.content.replace(/<@!?(\d+)>/g, '').trim();
  formattedMessage = VoiceVox.formatMessage(formattedMessage);

  const targetChannel = client.channels.cache.get(
    client.channelIdFor235Introduction,
  ) as TextChannel;

  const introductionDataList = await targetChannel.messages.fetch();
  const introductionData = introductionDataList.map((m) => m.content).join('\n');

  await (message.channel as TextChannel).sendTyping();

  const response: string = await gemini.generateResponseForGemini(
    formattedMessage,
    introductionData,
  );

  const responseList = response.split('\n\n');

  const formattedMessageList: string[] = [];
  let formattedMessageText = '';

  responseList.forEach((text: string) => {
    const textWithBreak = `${text}\n\n`;

    if (formattedMessageText.length + textWithBreak.length > 2000) {
      formattedMessageList.push(formattedMessageText);
      formattedMessageText = textWithBreak;
    } else {
      formattedMessageText += textWithBreak;
    }
  });

  if (formattedMessageText.length > 0) {
    formattedMessageList.push(formattedMessageText);
  }

  let geminiReplyIndex = 0;

  const geminiReplyTimer = setInterval(() => {
    if (geminiReplyIndex === formattedMessageList.length) {
      clearInterval(geminiReplyTimer);

      return;
    }

    message.reply(formattedMessageList[geminiReplyIndex]).catch(() => {});
    geminiReplyIndex += 1;
  }, 4_000);
};
