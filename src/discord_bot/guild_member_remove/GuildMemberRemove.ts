const { Client, Member } = require('discord.js');
const { DiscordBot } = require('../DiscordBot');
const { BirthdayFor235Member } = require('../../../models/index');

require('dotenv').config();

/**
 * サーバーから誰かが退出した時に行う処理クラス
 */
export class GuildMemberRemove {
  private discordBot: typeof DiscordBot;
  private readonly userIdForUtatane = process.env.USER_ID_FOR_UTATANE;
  private readonly userIdForMaki = process.env.USER_ID_FOR_MAKI;

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * guildMemberRemove メイン処理
   *
   * @return {void}
   */
  public guildMemberRemoveEvent(): void {
    this.discordBot.on('guildMemberRemove', (member: typeof Member) => {
      this.delete235MemberBirthday(member, this.discordBot);
    });
  }

  /**
   * 235プロダクションからメンバーが退出したタイミングで235プロダクションメンバーの誕生日テーブルからデータを削除
   *
   * @param {Member} member Memberクラス
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private delete235MemberBirthday(member: typeof Member, client: typeof Client): void {
    BirthdayFor235Member.delete235MemberBirthday(member.id)
    .then((deleteData: {name: string, user_id: string, month: number, date: number}[]) => {
      client.users.cache.get(this.userIdForMaki).send(`${member.nickname}さんがサーバーから退出されたため、${member.nickname}さんの誕生日を削除しました！`);
      client.users.cache.get(this.userIdForUtatane).send(`${member.nickname}さんがサーバーから退出されたため、${member.nickname}さんの誕生日を削除しました！\nもし間違いがあった場合は報告をお願いします！`);
    })
    .catch((error: unknown) => error);
  }
}
