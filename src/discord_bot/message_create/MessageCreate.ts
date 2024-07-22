const { Message, Client } = require('discord.js');
const { DiscordBot } = require('../DiscordBot');
const { BirthdayFor235Member } = require('../../../models/index');


/**
 * メッセージが送信された時に行う処理クラス
 */
export class MessageCreate {
  private discordBot: typeof DiscordBot;
  private readonly prefix: string = '235';
  private readonly setTimeoutSec: number = 15_000;

  private readonly birthday235MemberEmojiList: string[] = [
    '<:__:794969172630044674>',
    '<:__:794969688982552607>',
  ];

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * messageCreate メイン処理
   *
   * @return {void}
   */
  public messageCreateEvent(): void {
    this.discordBot.on('messageCreate', (message: typeof Message) => {
      // イベント企画で作成した文章にアクション

      this.reactToBirthday235MemberMessage(message);

      // ミリオンメンバーの誕生日をお祝いしてるメッセージにアクション

      // 235botのメッセージがリプライだった場合、1分後に削除
      if ((message.author.bot) && (message.mentions.repliedUser)) {
        setTimeout(() => message.delete(), 60_000);
      }

      // 雑談場（通話外）の235botのリプライじゃないメッセージを保存（１週間後に消すため）

      // botからのメッセージは無視
      if (message.author.bot) return;

      // chatgpt用

      // 自己紹介チャンネルから新しく入ったメンバーの誕生日を登録する＆挨拶をする
      if ((this.discordBot.channels.cache.get(this.discordBot.channelIdFor235Introduction) !== undefined) && (message.channelId === this.discordBot.channelIdFor235Introduction)) {
        // 誕生日を登録
        this.registNew235MemberBirthday(message, this.discordBot);

        // 挨拶
        message.reply(`${message.author.username}さん、235プロダクションへようこそ！\nこれからもよろしくおねがいします♪`);
      }

      // コマンドメッセージ以外は無視
      if (!message.content.startsWith(this.prefix)) return;

      const formattedCommand: string = message.content.slice(this.prefix.length);

      // 235しか入力されていなかった場合は無視
      if (formattedCommand === '') return;

      // コマンドと引数を配列で取得
      const commandList: string[] = formattedCommand.split(' ');
      // コマンドを取得
      const commandName: string = commandList.shift()!.toLowerCase();

      this.testCommand(message, commandName);
    });
  }

  /**
   * 235メンバーの誕生日をお祝いしてるメッセージにアクション
   *
   * @param message Messageクラス
   *
   * @return {void}
   */
  private reactToBirthday235MemberMessage(message: typeof Message): void {
    if (this.discordBot.isReactionCelebrate235MemberMessage) return;

    this.birthday235MemberEmojiList.forEach((emoji: string) => message.react(emoji));

    this.discordBot.isReactionCelebrate235MemberMessage = true;
  }

  /**
   * 235プロダクションに新しく入ってきた方の誕生日を登録
   *
   * @param {Message} message Messageクラス
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private registNew235MemberBirthday(message: typeof Message, client: typeof Client): void {
    const messageList: string[] = message.content.replace(/\r?\n/g, '').split(/：|・/);
    const foundIndex: number = messageList.indexOf('生年月日');

    if (foundIndex === -1) return;

    const birthdayList: string[] = messageList[foundIndex + 1].split(/年|月|\//).map(data => data.match(/\d+/g)![0].replace(/^0+/, ''));

    if (birthdayList.length === 3) {
      birthdayList.shift();
    }

    BirthdayFor235Member.registNew235MemberBirthday(
      message.author.username,
      message.author.id,
      birthdayList[0],
      birthdayList[1]
    )
    .then((newData: {
      name: string,
      user_id: string,
      month: number,
      date: number
    }[]) => {
      client.users.cache.get(this.discordBot.userIdForMaki).send(`${message.author.username}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日`);
      client.users.cache.get(this.discordBot.userIdForUtatane).send(`${message.author.username}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日\nもし間違いがあった場合は報告をお願いします！`);
    })
    .catch((error: unknown) => {
      client.users.cache.get(this.discordBot.userIdForMaki).send(`${message.author.username}さんの誕生日を登録できませんでした。`);
    });
  }

  /**
   * 235testコマンド 新しい機能を追加する時に実験とかする用
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   *
   * @return {void}
   */
  private testCommand(message: typeof Message, commandName: string): void {
    if ((commandName !== 'test') || (message.author.id !== this.discordBot.userIdForMaki)) return;

    message.reply('テスト用コマンド');

    setTimeout(async () => {
      await message.delete();
    }, this.setTimeoutSec);
  }
}
