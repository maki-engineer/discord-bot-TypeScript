import { Message, TextChannel, VoiceBasedChannel } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 配列の要素の中身をシャッフル
 *
 * @param {T[]} memberList シャッフル対象のメンバーリスト
 *
 * @return {T[]}
 */
const shuffle = <T>(memberList: T[]) => {
  const out = Array.from(memberList);

  for (let i = out.length - 1; i > 0; i -= 1) {
    const r = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[r];
    out[r] = tmp;
  }

  return out;
};

/**
 * 235roomdivisionコマンド ボイスチャンネルに参加しているメンバーを分ける
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {Message} message Messageクラス
 * @param {string} commandName 入力されたコマンド名
 */
export default async (client: DiscordBotType, message: Message, commandName: string) => {
  if (commandName !== 'roomdivision') return;

  const setTimeoutSec = 15_000;

  const targetChannel = client.voice.client.channels.cache.get(
    client.voiceChannelIdFor235ChatPlace,
  )! as VoiceBasedChannel;

  let participatingVoiceChannelMemberList = targetChannel.members
    .filter((member) => member.user.bot === false)
    .map((member) => {
      return {
        userName: member.user.globalName!,
        userId: member.user.id,
      };
    });

  const isParticipateVoiceChannelUsedCommandMember = participatingVoiceChannelMemberList.some(
    (participatingVoiceChannelMember) =>
      participatingVoiceChannelMember.userId === message.author.id,
  );

  if (!isParticipateVoiceChannelUsedCommandMember) {
    await message.reply(
      '235roomdivision コマンドは、【雑談１】ボイスチャンネルに参加しているメンバーが使用できるコマンドです。',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  if (participatingVoiceChannelMemberList.length < 10) {
    await message.reply(
      '【雑談１】ボイスチャンネルに参加しているメンバーの人数が10人未満のため、分けることが出来ません！',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  await (message.channel as TextChannel).sendTyping();

  let halfIndex = 0;
  let halfIndex2 = 0;

  // 配列を分ける
  if (participatingVoiceChannelMemberList.length % 2 === 0) {
    halfIndex = Math.floor(participatingVoiceChannelMemberList.length / 2) - 1;
    halfIndex2 = participatingVoiceChannelMemberList.length - halfIndex - 1;
  } else {
    halfIndex = Math.floor(participatingVoiceChannelMemberList.length / 2);
    halfIndex2 = participatingVoiceChannelMemberList.length - halfIndex;
  }

  let duplicationCount = 100;
  let halfMemberList: { userName: string; userId: string }[] = [];
  let halfMemberList2: { userName: string; userId: string }[] = [];

  while (duplicationCount >= 3) {
    // 初期化
    participatingVoiceChannelMemberList = shuffle(participatingVoiceChannelMemberList);

    halfMemberList = [];
    halfMemberList2 = [];

    for (let i = 0; i <= halfIndex; i += 1) {
      halfMemberList.push(participatingVoiceChannelMemberList[i]);
    }

    for (let i = halfIndex2; i < participatingVoiceChannelMemberList.length; i += 1) {
      halfMemberList2.push(participatingVoiceChannelMemberList[i]);
    }

    // 3人以上被ってないかチェック
    duplicationCount = halfMemberList2.filter((participatingVoiceChannelMember) => {
      return client.dividedUserIdList.indexOf(participatingVoiceChannelMember.userId) !== -1;
    }).length;
  }

  // 2個目の配列のメンバーを雑談２ボイスチャンネルに移動
  const dividedUserNameList = halfMemberList.map((dividedMember) => dividedMember.userName);

  const dividedUserNameList2 = halfMemberList2.map((dividedMember) => dividedMember.userName);

  const dividedUserIdList2 = halfMemberList2.map((dividedMember) => dividedMember.userId);

  client.dividedUserIdList = dividedUserIdList2;

  setTimeout(
    () =>
      message.reply(
        `このような結果になりました！\n\n**【雑談１】**\n------------------------------------------------------------\n${dividedUserNameList.join('\n')}\n------------------------------------------------------------\n\n**【雑談２】**\n------------------------------------------------------------\n${dividedUserNameList2.join('\n')}\n------------------------------------------------------------\n\n自動で分けられますのでしばらくお待ちください。`,
      ),
    2_000,
  );

  let divisionCount = 0;

  const targetGuildChannel = client.guilds.cache.get(client.serverIdFor235)!;

  setTimeout(() => {
    const roomDivideTimer = setInterval(() => {
      switch (divisionCount) {
        case halfMemberList2.length:
          message.delete().catch(() => {});
          clearInterval(roomDivideTimer);
          break;

        default:
          targetGuildChannel.members
            .fetch(dividedUserIdList2[divisionCount])
            .then((member) => member.voice.setChannel(client.voiceChannelIdFor235ChatPlace2))
            .catch(() => {});

          divisionCount += 1;
          break;
      }
    }, 1_000);
  }, 9_000);
};
