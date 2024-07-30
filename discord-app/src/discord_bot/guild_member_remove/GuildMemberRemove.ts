const { Client, Member } = require('discord.js');
const DiscordBot = require('../DiscordBot').default;
const { BirthdayFor235Member } = require('../../../models/index');

/**
 * サーバーから誰かが退出した時に行う処理クラス
 */
export default class GuildMemberRemove {
  private discordBot: typeof DiscordBot;

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
    if (member.user.bot) return;

    BirthdayFor235Member.delete235MemberBirthday(member.user.id)
      .then(() => {
        client.users.cache.get(this.discordBot.userIdForMaki).send(`${member.user.globalName}さんがサーバーから退出されたため、${member.user.globalName}さんの誕生日を削除しました！`);
        client.users.cache.get(this.discordBot.userIdForUtatane).send(`${member.user.globalName}さんがサーバーから退出されたため、${member.user.globalName}さんの誕生日を削除しました！\nもし間違いがあった場合は報告をお願いします！`);
      });
  }
}
