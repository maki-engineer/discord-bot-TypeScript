import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  Message,
  TextChannel,
} from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';

/**
 * オンライン飲み会、男子会のイベントを作成
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {string} eventTitle 作成するイベント名
 * @param {string} description 作成するイベントの説明
 * @param {Date} scheduledStartTime イベントの開始日
 * @param {string} channelId 開始場所（ボイスチャンネルのID）
 * @param {string | null} image アイコン画像
 *
 * @return {string}
 */
const createScheduleEvent = async (
  client: DiscordBotType,
  eventTitle: string,
  description: string,
  scheduledStartTime: Date,
  channelId: string,
  image: string | null = null,
) => {
  const guild = client.guilds.cache.get(client.serverIdFor235)!;

  const options = {
    name: eventTitle,
    scheduledStartTime,
    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
    entityType: GuildScheduledEventEntityType.Voice,
    description,
    channel: channelId,
    image,
  };

  const createdEvent = await guild.scheduledEvents.create(options);

  return createdEvent.id;
};

/**
 * 235birthdayコマンド 毎月の誕生日祝い企画文章を作成
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {string} commandName 入力されたコマンド名
 * @param {string[]} commandList 引数一覧
 */
export default async (
  message: Message,
  client: DiscordBotType,
  commandName: string,
  commandList: string[],
) => {
  if (commandName !== 'birthday' || message.author.id !== client.userIdForUtatane) return;

  const setTimeoutSec = 15_000;

  if (commandList.length < 3 || commandList.length > 4) {
    await message.reply(
      '235birthdayコマンドを使う場合、birthdayの後にオンライン飲み会を開催したい月、日、時間 （半角数字のみ、曜日は不要） の3つを入力してください。\n任意のテキストを追加したい場合は、3つ入力した後に、追加したいテキストを入力してください。\n※半角スペースで区切るのを忘れずに！！\n\n235birthday 8 15 21',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  let isAllInt = true;

  for (let i = 0; i < commandList.length; i += 1) {
    // 追加文章はバリデーションチェックしない
    if (i === 3) {
      break;
    }

    if (!Number.isInteger(Number(commandList[i]))) {
      isAllInt = false;
      break;
    }
  }

  if (!isAllInt) {
    await message.reply(
      '半角数字以外が含まれています！\n月、日、時間は全て**半角数字のみ**で入力してください！',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  if (Number(commandList[0]) < 1 || Number(commandList[0]) > 12) {
    await message.reply('月は1～12の間で入力してください！');

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  const today = new Date();
  const lastDateTime = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  // 今月末日を取得
  const lastDate = lastDateTime.getDate();

  if (Number(commandList[1]) < 1 || Number(commandList[1]) > lastDate) {
    await message.reply(`日は1～${lastDate}の間で入力してください！`);

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  if (Number(commandList[2]) < 0 || Number(commandList[2]) > 23) {
    await message.reply('時間は0～23の間で入力してください！');

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  const todayYear = today.getFullYear();
  const eventDateTime = new Date(
    todayYear,
    Number(commandList[0]) - 1,
    Number(commandList[1]),
    Number(commandList[2]) - 9,
  );
  const eventDay = eventDateTime.getDay();

  const week = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

  const textList = [
    [
      `日々のプロデュース業お疲れ様です！！！　${commandList[0]}月に誕生日を迎える方々をご紹介します！！！\n${commandList[0]}月に誕生日を迎えるのは～......\n\n`,
      `日々のプロデュース業お疲れ様です！${commandList[0]}月にお誕生日を迎える方々のご案内です！\n${commandList[0]}月に誕生日を迎えるのは～…\n\n`,
      `日々のプロデュース業お疲れ様です！${commandList[0]}月にお誕生日を迎えるメンバーさんの…ご案内です！！\n${commandList[0]}月に誕生日を迎えるのは～…\n\n`,
      `日々のプロデュース業お疲れ様です！\n${commandList[0]}月期ラウンジオンライン飲み会のご！案！内！です！\n${commandList[0]}月の誕生日は～～～～…\n\n`,
      `日々のプロデュース業お疲れ様です！${commandList[0]}月に誕生日を迎える方々をご紹介します！\n${commandList[0]}月に誕生日を迎えるのは～…\n\n`,
      '日々のプロデュース業お疲れ様です！！！今月お誕生日を迎えるのは～…\n\n',
      `日々のプロデュース業お疲れ様です！${commandList[0]}月が誕生日のメンバーさんをご紹介します！${commandList[0]}月に誕生日を迎えるのは～…\n\n`,
    ],
    [
      `\nです！！！はっぴばーす！と、いうわけで${commandList[0]}月期ラウンジオンライン飲み会のご案内でぇす！！！`,
      `\nです！はっぴばーす！！！いや～めでたいねぇ（ひなた）\nではでは、${commandList[0]}月期ラウンジオンライン飲み会のご案内です！\n\nQ.ラウンジオンライン飲み会ってなんなん？\nA.ラウンジDiscordに集まってオンラインでやる飲み会だよ！まんまだね！お酒飲めない子はジュースだね！\n　その月の誕生日の人が来たらバースデーを歌ってあげる~~奇習~~お祝いがあるよ！`,
      `\nです！！！！！おめでとうございますわ～～～～～～～～！！！！！！\nというわけで！${commandList[0]}月期ラウンジオンライン飲み会のご案内です！\n\nQ.ラウンジオンライン飲み会ってなんなん？\nA.ラウンジDiscordに集まってオンラインでやる飲み会だよ！まんまだね！\n　あと、その月の誕生日の人が来たらバースデーを歌ってあげる~~奇習~~お祝いがあるよ！`,
      '\nです！！！！！！です！おめでとうございます～～～～～～！！！！！！！',
      '\nです！おめでとうございま～～～す！！！\nというわけで、毎月恒例のオンライン飲み会のご案内です！！！',
      '\nでぇす！はっぴば～～～す！！！\nということで、月一回、恒例のオンライン飲み会のご案内です！',
      `\nです！！！おめでとうございま～す！！いやぁめでたいねぇ（ひなた）\nということで${commandList[0]}月期のオンライン飲み会のご案内でーす！`,
      `\nでーす！はっぴばーす！素敵な一年にしましょうね！\nということで今月もやってきました、${commandList[0]}月期オンライン飲み会のごあんないです！！！`,
    ],
    [
      '遅刻OK早上がりOK、お酒やジュースを飲みながらおしゃべりを楽しむ月一の定例飲み会です！\n皆さんお気軽にご参加お待ちしてま～～～～す(o・∇・o)',
      '遅れて参加してもOK、眠くなったら先に眠ってもOKの飲み会です！周年イベントが明けても次のイベントはすぐに始まるから（遠い目） お疲れ様会も兼ねて盛り上がってまいりましょう～！多くの皆様方のご参加をお待ちしております！！！！！！！！！お酒お酒お酒お酒！！！！！！！！！',
      '遅れて参加してもOK!!眠くなったら先に眠ってもOK!!の飲み会です！気持ちアゲていきましょう！！！！ぶいぶい！！！！！！お酒お酒お酒お酒!!!!!!',
      '遅れて参加してもOK,眠くなったら先に上がってもOKの飲み会です、気ままに楽しみましょう！！！どしどしご参加くださいーーーー！！！！！お酒お酒お酒!!!',
      '遅れて参加しても良し、眠くなったら先に上がっても寝落ちしてもOKの飲み会です。気軽に和気あいあい楽しみましょう！どしどしご参加くーださい(o・∇・o)',
      '特に時間などに縛りはございません。好きな時間に来て好きなだけ飲んで話して好きな時間に上がれる飲み会です。まったりのんびり楽しく過ごしましょう～！！！\nお酒お酒お酒お酒お酒!!!!!!!!',
      '遅刻OK早上がりOK、お酒やジュースを飲みながらおしゃべりを楽しむ月一の定例飲み会です！皆さんお気軽にご参加お待ちしてま~~~~す',
    ],
  ];

  let eventText = `@everyone\n${textList[0][Math.floor(Math.random() * textList[0].length)]}`;

  const birthdayMemberList = await BirthdayFor235MemberRepository.getThisMonthBirthdayMember(
    Number(commandList[0]),
  );
  birthdayMemberList.forEach((birthdayMember) => {
    eventText += `**${birthdayMember.date}日...${birthdayMember.name}さん**\n`;
  });

  eventText += textList[1][Math.floor(Math.random() * textList[1].length)];

  eventText += `\n\n**開催日：${commandList[0]}月${commandList[1]}日 （${week[eventDay]}）**\n**時間：${commandList[2]}時ごろ～眠くなるまで**\n**場所：ラウンジDiscord雑談通話**\n**持参品：**:shaved_ice::icecream::ice_cream::cup_with_straw::champagne_glass::pizza::cookie:\n\n`;

  eventText += textList[2][Math.floor(Math.random() * textList[2].length)];

  if (commandList.length === 4) {
    eventText += `\n${commandList[3]}`;
  }

  await (message.channel as TextChannel).send(eventText);

  const description = commandList[3] ?? 'ラウンジDiscordに集まってオンラインでやる飲み会だよ！';

  const eventId = await createScheduleEvent(
    client,
    `${commandList[0]}月期ラウンジオンライン飲み会`,
    description,
    eventDateTime,
    client.voiceChannelIdFor235ChatPlace,
  );

  setTimeout(
    () =>
      message.reply(
        `うたたねさん、今回もお疲れ様です！\n\n【${commandList[0]}月期ラウンジオンライン飲み会】のイベントを作成しました！\nhttps://discord.com/events/${client.serverIdFor235}/${eventId}\n\nいつもありがとうございます♪`,
      ),
    6_000,
  );

  setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);
};
