import type {
  GuildMember as GuildMemberType,
  PartialGuildMember as PartialGuildMemberType,
} from 'discord.js';
import type { DiscordBotType } from '../DiscordBotType';

import delete235MemberBirthday from './delete235MemberBirthday';

/**
 * サーバーから誰かが退出した時に行う処理クラス
 */
export default class GuildMemberRemove {
  private discordBot: DiscordBotType;

  constructor(discordBot: DiscordBotType) {
    this.discordBot = discordBot;
  }

  /**
   * guildMemberRemove メイン処理
   *
   * @return {void}
   */
  public guildMemberRemoveEvent(): void {
    this.discordBot.on(
      'guildMemberRemove',
      async (member: GuildMemberType | PartialGuildMemberType) => {
        await delete235MemberBirthday(member, this.discordBot);
      },
    );
  }
}
