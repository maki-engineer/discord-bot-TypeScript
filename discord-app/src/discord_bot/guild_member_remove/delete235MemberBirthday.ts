import type {
  GuildMember as GuildMemberType,
  PartialGuildMember as PartialGuildMemberType,
} from 'discord.js';
import type { DiscordBotType } from '../DiscordBotType';

import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';

/**
 * 235プロダクションからメンバーが退出したタイミングで235プロダクションメンバーの誕生日テーブルからデータを削除
 *
 * @param {GuildMemberType PartialGuildMemberType} member GuildMemberクラス | PartialGuildMemberクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (member: GuildMemberType | PartialGuildMemberType, client: DiscordBotType) => {
  if (member.user.bot) return;

  await BirthdayFor235MemberRepository.delete235MemberBirthday(member.user.id);

  await client.users.cache
    .get(client.userIdForMaki)!
    .send(
      `${member.user.globalName!}さんがサーバーから退出されたため、${member.user.globalName!}さんの誕生日を削除しました！`,
    );
  await client.users.cache
    .get(client.userIdForUtatane)!
    .send(
      `${member.user.globalName!}さんがサーバーから退出されたため、${member.user.globalName!}さんの誕生日を削除しました！\nもし間違いがあった場合は報告をお願いします！`,
    );
};
