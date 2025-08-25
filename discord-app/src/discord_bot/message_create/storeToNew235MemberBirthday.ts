import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';

/**
 * 235プロダクションに新しく入ってきた方の誕生日を登録
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, client: DiscordBotType) => {
  if (
    client.channels.cache.get(client.channelIdFor235Introduction) === undefined ||
    message.channelId !== client.channelIdFor235Introduction
  ) {
    return;
  }

  const messageList = message.content.replace(/\r?\n/g, '').split(/：|・/);
  const foundIndex = messageList.indexOf('生年月日');

  if (foundIndex === -1) return;

  const birthdayList = messageList[foundIndex + 1]
    .split(/年|月|\//)
    .flatMap((data) => (data.match(/\d+/g) || []).map((d) => d.replace(/^0+/, '')));

  if (birthdayList.length === 3) {
    birthdayList.shift();
  }

  await BirthdayFor235MemberRepository.registNew235MemberBirthday(
    message.author.globalName as string,
    message.author.id,
    Number(birthdayList[0]),
    Number(birthdayList[1]),
  );

  const makiUser = client.users.cache.get(client.userIdForMaki)!;
  const utataneUser = client.users.cache.get(client.userIdForUtatane)!;

  await makiUser.send(
    `${message.author.globalName}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日`,
  );

  await utataneUser.send(
    `${message.author.globalName}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日\nもし間違いがあった場合は報告をお願いします！`,
  );
};
