import { clearInterval } from "timers";

const { Client, Message } = require('discord.js');
const { DiscordBot } = require('../DiscordBot');
const { DeleteMessage } = require('../../../models/index');

require('dotenv').config();

/**
 * 常時行う処理クラス
 */
export class Ready {
  private discordBot: typeof DiscordBot;
  private readonly today      = new Date();
  private readonly todayYear  = this.today.getFullYear();
  private readonly todayMonth = this.today.getMonth() + 1;
  private readonly todayDate  = this.today.getDate();
  private readonly todayHour  = this.today.getHours();
  private readonly todayMin   = this.today.getMinutes();
  private readonly serverIdFor235 = process.env.SERVER_ID_FOR_235;
  private readonly channelIdFor235ChatPlace = process.env.CHANNEL_ID_FOR_235_CHAT_PLACE;
  private readonly userIdForMaki = process.env.USER_ID_FOR_MAKI;
  private readonly commandList: {name: string, description: string}[] = [
    {name: '235ap', description: 'APすることが出来た曲を登録するときに使用するコマンドです。'},
    {name: '235apremove', description: '間違ってAP曲データに登録してしまった曲を取り消すときに使用するコマンドです。'},
    {name: '235apall', description: 'これまでAPしてきた曲や曲数を知りたいときに使用するコマンドです。'},
    {name: '235notap', description: 'まだAPすることが出来ていない曲や曲数を知りたいときに使用するコマンドです。'},
    {name: '235apsearch', description: '入力した曲がAP出来ているか知りたいときに使用するコマンドです。'},
    {name: '235birthday', description: '毎月開催されるオンライン飲み会の企画文章を作成したいときに使用するコマンドです。'},
    {name: '235men', description: '毎月開催される235士官学校🌹の日程を決めるときに使用するコマンドです。'},
    {name: '235roomdivision', description: 'ボイスチャンネルに参加しているメンバーを分けたいときに使用するコマンドです。'},
  ];

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * 235botのコマンドを設定
   * これをすることによって、スラッシュコマンドを使用する時に、235botのコマンドがすぐに出てくるようになる。
   *
   * @return {void}
   */
  public setCommand(): void {
    if (this.discordBot.guilds.cache.get(this.serverIdFor235) === undefined) return;

    this.discordBot.application.commands.set(this.commandList, this.serverIdFor235);
  }

  /**
   * 235botのステータスを設定
   * これを設定することによって、「〇〇をプレイ中」のように表示させることが出来る。
   *
   * @return {void}
   */
  public setStatus(): void {
    this.discordBot.user.setPresence({
      activities: [{name: 'アイドルマスター ミリオンライブ! シアターデイズ '}],
      status: 'online'
    });
  }

  /**
   * ready メイン処理
   *
   * @return {void}
   */
  public readyEvent(): void {
    this.deleteOldMessageFrom235ChatPlaceChannel(this.discordBot);
    this.celebrate235Member(this.discordBot);
    this.celebrateMillionMember(this.discordBot);
    this.celebrate235ProductionAnniversary(this.discordBot);
    this.celebrateMillionLiveAnniversary(this.discordBot);
  }

  /**
   * 雑談場（通話外）チャンネルでメッセージ送信して1週間経ったメッセージを削除
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private deleteOldMessageFrom235ChatPlaceChannel(client: typeof Client): void {
    if (client.channels.cache.get(this.channelIdFor235ChatPlace) === undefined) return;

    let setTime = new Date();
    setTime.setDate(setTime.getDate() - 7);
    const dateSevenDaysAgo = setTime.getDate();

    DeleteMessage.findDeleteMessages(dateSevenDaysAgo)
    .then((foundData: {message_id: string, date: number}[]) => {
      if (foundData.length === 0) return;

      let deleteIndex: number = 0;

      let deleteTimer = setInterval(() => {
        switch (deleteIndex) {
          case foundData.length:
            clearInterval(deleteTimer);
            break;

          default:
            client.channels.cache.get(this.channelIdFor235ChatPlace).messages.fetch(foundData[deleteIndex].message_id)
            .then((message: typeof Message) => {
              message.delete();
              DeleteMessage.deleteMessage(foundData[deleteIndex].message_id);
              deleteIndex++;
            })
            .catch((error: unknown)  => {
              client.users.cache.get(this.userIdForMaki).send('メッセージを削除できませんでした。');
            });
            break;
        }
      }, 5_000);
    })
    .catch((error: unknown) => error);
  }

  /**
   * 9時に235プロダクションのメンバーの誕生日をお祝い
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrate235Member(client: typeof Client): void {
    //
  }

  /**
   * 9時半にミリオンメンバーの誕生日をお祝い
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrateMillionMember(client: typeof Client): void {
    //
  }

  /**
   * 10時に周年祝い（235プロダクション）
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrate235ProductionAnniversary(client: typeof Client): void {
    //
  }

  /**
   * 10時に周年祝い（ミリオンライブ）
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrateMillionLiveAnniversary(client: typeof Client): void {
    //
  }
}
