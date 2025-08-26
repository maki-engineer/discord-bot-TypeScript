import { Message } from 'discord.js';
import birthdayEventCommand from './birthdayEventCommand';
import disconnectVoiceChannelCommand from './disconnectVoiceChannelCommand';
import deleteReplyMessage from './deleteReplyMessage';
import generateResponseForGemini from './generateResponseForGemini';
import Gemini from '../../gemini/Gemini';
import greetToNew235Member from './greetToNew235Member';
import helpCommand from './helpCommand';
import joinVoiceChannelCommand from './joinVoiceChannelCommand';
import menEventCommand from './menEventCommand';
import roomDivisionCommand from './roomDivisionCommand';
import storeMessage from './storeMessage';
import storeToNew235MemberBirthday from './storeToNew235MemberBirthday';
import readTextForVoiceVox from './readTextForVoiceVox';
import reactToBirthday235MemberMessage from './reactToBirthday235MemberMessage';
import reactToBirthdayMillionMemberMessage from './reactToBirthdayMillionMemberMessage';
import VoiceVox from '../../voice_vox/VoiceVox';
import { DiscordBotType } from '../DiscordBotType';

/**
 * メッセージが送信された時に行う処理クラス
 */
export default class MessageCreate {
  private discordBot: DiscordBotType;

  private gemini: Gemini;

  private voiceVox: VoiceVox;

  private readonly prefix = '235';

  /**
   * @param {DiscordBotType} discordBot DiscordBotクラス
   * @param {VoiceVox} voiceVox VoiceVoxクラス
   */
  constructor(discordBot: DiscordBotType, voiceVox: VoiceVox) {
    this.discordBot = discordBot;
    this.voiceVox = voiceVox;

    this.gemini = new Gemini();
  }

  /**
   * messageCreate メイン処理
   */
  public messageCreateEvent(): void {
    this.discordBot.on('messageCreate', async (message: Message) => {
      reactToBirthday235MemberMessage(message, this.discordBot);
      await reactToBirthdayMillionMemberMessage(message, this.discordBot);
      deleteReplyMessage(message);
      await storeMessage(message, this.discordBot);

      // botからのメッセージは無視
      if (message.author.bot) return;

      await generateResponseForGemini(message, this.gemini, this.discordBot);
      await readTextForVoiceVox(message, this.voiceVox, this.discordBot);
      await storeToNew235MemberBirthday(message, this.discordBot);
      await greetToNew235Member(message, this.discordBot);

      // コマンドメッセージ以外は無視
      if (!message.content.startsWith(this.prefix)) return;

      const formattedCommand: string = message.content.slice(this.prefix.length);

      // 235しか入力されていなかった場合は無視
      if (formattedCommand === '') return;

      // コマンドと引数を配列で取得
      const commandList: string[] = formattedCommand.split(' ');
      // コマンドを取得
      const commandName: string = commandList.shift()!.toLowerCase();

      await helpCommand(message, this.discordBot, commandName);
      await birthdayEventCommand(message, this.discordBot, commandName, commandList);
      await menEventCommand(message, this.discordBot, commandName, commandList);
      await roomDivisionCommand(this.discordBot, message, commandName);
      await joinVoiceChannelCommand(message, this.voiceVox, this.discordBot, commandName);
      await disconnectVoiceChannelCommand(message, this.discordBot, commandName);
    });
  }
}
