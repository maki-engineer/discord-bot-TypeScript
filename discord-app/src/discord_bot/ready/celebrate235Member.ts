import { TextChannel } from 'discord.js';
import getTodayDateList from './getTodayDateList';
import { DiscordBotType } from '../DiscordBotType';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';

/**
 * 9時に235プロダクションのメンバーの誕生日をお祝い
 *
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (client: DiscordBotType) => {
  const todayDateList = getTodayDateList();

  await BirthdayFor235MemberRepository.get235MemberBirthdayList(
    client.userIdForMaki,
    todayDateList.todayMonth,
    todayDateList.todayDate,
  ).then((birthdayData) => {
    if (birthdayData.length === 0) return;

    const birthday235MemberEmojiList = ['<:__:794969172630044674>', '<:__:794969688982552607>'];
    const targetMessage = client.channels.cache.get(client.channelIdFor235ChatPlace) as TextChannel;

    switch (birthdayData.length) {
      case 1:
        targetMessage
          .send(
            `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[0].name}さん**のお誕生日です！！\n${birthdayData[0].name}さん、お誕生日おめでとうございます♪`,
          )
          .then((birthdayMessage) =>
            birthday235MemberEmojiList.map((emoji) => birthdayMessage.react(emoji)),
          )
          .catch(() => {});

        break;

      default: {
        let birthdayIndex: number = 0;

        const birthdayTimer = setInterval(() => {
          switch (birthdayIndex) {
            case birthdayData.length:
              clearInterval(birthdayTimer);
              break;

            case 0:
              targetMessage
                .send(
                  `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[birthdayIndex].name}さん**のお誕生日です！！\n${birthdayData[birthdayIndex].name}さん、お誕生日おめでとうございます♪`,
                )
                .then((birthdayMessage) =>
                  birthday235MemberEmojiList.map((emoji) => birthdayMessage.react(emoji)),
                )
                .catch(() => {});

              birthdayIndex += 1;
              break;

            default:
              targetMessage
                .send(
                  // eslint-disable-next-line no-irregular-whitespace
                  `さらに！！　本日は**${birthdayData[birthdayIndex].name}さん**のお誕生日でもあります！！\n${birthdayData[birthdayIndex].name}さん、お誕生日おめでとうございます♪`,
                )
                .then((birthdayMessage) =>
                  birthday235MemberEmojiList.map((emoji) => birthdayMessage.react(emoji)),
                )
                .catch(() => {});

              birthdayIndex += 1;
              break;
          }
        }, 4_000);
        break;
      }
    }
  });
};
