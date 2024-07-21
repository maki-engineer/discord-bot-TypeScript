const { Message, Client } = require('discord.js');
const { DiscordBot } = require('../DiscordBot');
const { BirthdayForMillionMember } = require('../../../models/index');

require('dotenv').config();


/**
 * メッセージが送信された時に行う処理クラス
 */
export class MessageCreate {
  private discordBot: typeof DiscordBot;
  private readonly prefix: string = '235';
  private readonly setTimeoutSec: number = 15_000;
  private readonly channelIdFor235Introduction = process.env.CHANNEL_ID_FOR_235_INTRODUCTION;
  private readonly userIdForUtatane = process.env.USER_ID_FOR_UTATANE;
  private readonly userIdForMaki = process.env.USER_ID_FOR_MAKI;

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
      // イベント企画の文章作成機能でアクションを付ける必要がある235botのメッセージだけは反応する

      // 235メンバーの誕生日をお祝い

      // ミリオンメンバーの誕生日をお祝い

      // 235botのメッセージがリプライだった場合、1分後に削除
      if ((message.author.bot) && (message.mentions.repliedUser)) {
        setTimeout(() => message.delete(), 60_000);
      }

      // 雑談場（通話外）の235botのリプライじゃないメッセージを保存（１週間後に消すため）

      // botからのメッセージは無視
      if (message.author.bot) return;

      // chatgpt用

      // 自己紹介チャンネルから新しく入ったメンバーの誕生日を登録する＆挨拶をする
      if ((this.discordBot.channels.cache.get(this.channelIdFor235Introduction) !== undefined) && (message.channelId === this.channelIdFor235Introduction)) {
        // 誕生日を登録
        this.registNewMemberBirthday(message, this.discordBot);

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
   * 235プロダクションに新しく入ってきた方の誕生日を登録
   *
   * @param {Message} message Messageクラス
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private registNewMemberBirthday(message: typeof Message, client: typeof Client): void {
    const messageList: string[] = message.content.replace(/\r?\n/g, '').split(/：|・/);
    const foundIndex: number = messageList.indexOf('生年月日');

    if (foundIndex === -1) return;

    let birthdayList: string[] = messageList[foundIndex + 1].split(/年|月|\//).map(data => data.match(/\d+/g)![0].replace(/^0+/, ''));

    if (birthdayList.length === 3) {
      birthdayList.shift();
    }

    // db.run("insert into birthday_for_235_members(name, user_id, month, date) values(?, ?, ?, ?)", message.author.username, message.author.id, birthday[0], birthday[1]);

    client.users.cache.get(this.userIdForMaki).send(`${message.author.username}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日`);
    client.users.cache.get(this.userIdForUtatane).send(`${message.author.username}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日\nもし間違いがあった場合は報告をお願いします！`);
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
    if ((commandName !== 'test') || (message.author.id !== this.userIdForMaki)) return;

    message.reply('テスト用コマンド');

    setTimeout(() => {
      message.delete()
      .then((message: typeof Message) => message)
      .catch((error: unknown) => error);
    }, this.setTimeoutSec);
  }
}
