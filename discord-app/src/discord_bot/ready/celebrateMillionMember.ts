import { TextChannel } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import BirthdayForMillionMemberRepository from '../../../repositories/BirthdayForMillionMemberRepository';
import getTodayDateList from './getTodayDateList';

/**
 * 誕生日アイドルの絵文字リストの中からアクションを付ける絵文字を取得
 *
 * @param {{ name: string, emoji: string }[]} emojiList 誕生日アイドルの絵文字リスト
 * @param {string} idolName 誕生日のアイドル名
 *
 * @return {string} アクションする絵文字
 */
const getTargetEmoji = (emojiList: { name: string; emoji: string }[], idolName: string) => {
  const targetEmoji = emojiList.find((data) => data.name === idolName);

  return targetEmoji!.emoji;
};

/**
 * 9時半にミリオンメンバーの誕生日をお祝い
 *
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default (client: DiscordBotType) => {
  const todayDateList = getTodayDateList();
  const millionMemberEmojiList = [
    { name: '白石紬', emoji: '<:Tsumu_Tere:1130877675712565318>' },
    { name: '望月杏奈', emoji: '<:Anna_Mochi:1112376914502488064>' },
    { name: '如月千早', emoji: '<:Chihaya_Dog:995364437634596875>' },
    { name: '篠宮可憐', emoji: '<:Karen_Mochi:1139225252250009600>' },
    { name: '真壁瑞希', emoji: '<:LittleMizuki:1068329867961184328>' },
    { name: '百瀬莉緒', emoji: '<:Rio:1080925060631642112>' },
    { name: '天海春香', emoji: '<:haruka:1092410072375763045>' },
    { name: '最上静香', emoji: '<:mogasizu:1096430399284060190>' },
    { name: '四条貴音', emoji: '<:ohimechin:1032648299733331989>' },
    { name: '松田亜利沙', emoji: '<:Arisa:1115823606136582195>' },
    { name: '馬場このみ', emoji: '<:Neesan:1117768357039583322>' },
    { name: '秋月律子', emoji: '<:Ritsuko:1139199929802305637>' },
    { name: '春日未来', emoji: '<:Mirai__:1139201737085947924>' },
    { name: '木下ひなた', emoji: '<:Hinata_SHS:1125785784323158037>' },
    { name: '高木社長', emoji: '<:_Takagi_Syatyou:1126309990962036777>' },
    { name: '三浦あずさ', emoji: '<:Azusa:1139198589755723816>' },
    { name: '舞浜歩', emoji: '<:_Stmp_Ayumu:794969740060655626>' },
    { name: '伊吹翼', emoji: '<:Tsubasa:1139198525507371149>' },
    { name: '高坂海美', emoji: '<:Umi_tere:1139235803684405258>' },
    { name: '矢吹可奈', emoji: '<:Kana_Dog:1139236252940521513>' },
    { name: '菊池真', emoji: '<:Makorin_Wink:1125429449748389998>' },
    { name: '豊川風花', emoji: '<:Fuka_Tere:1139199364779216976>' },
    { name: '永吉昴', emoji: '<:Subaru_Suggee:1125776602542911598>' },
    { name: 'ジュリア', emoji: '<:Julia_Wink:1139200898619408504>' },
    { name: '田中琴葉', emoji: '<:Kotoha__:1139225338258391090>' },
    { name: '我那覇響', emoji: '<:Hibiki_Surprise:1139567838269542491>' },
    { name: '二階堂千鶴', emoji: '<:Chizuru:1139199408777478238>' },
    { name: '島原エレナ', emoji: '<:Elena_Weitress:1131573622310453359>' },
    { name: '周防桃子', emoji: '<:Momoko2:1139225298488000592>' },
    { name: '天空橋朋花', emoji: '<:Tomoka_Suyapu:1139199590592151624>' },
    { name: '北沢志保', emoji: '<:Shiho_Maid:1139200614430162954>' },
    { name: '星井美希', emoji: '<:Miki:1139201992955285694>' },
    { name: '野々原茜', emoji: '<:Akane_Wink:1139200848568799262>' },
    { name: '中谷育', emoji: '<:Ikusan_Horane:1139565196654948412>' },
    { name: '萩原雪歩', emoji: '<:Yukiho_Mochi:1139237641628422174>' },
    { name: '高山紗代子', emoji: '<:Sayoko2:1139225443204075530>' },
    { name: '双海真美', emoji: '<:Mami__:1139236461233848371>' },
    { name: '双海亜美', emoji: '<:Ami:1139235860521423029>' },
    { name: '北上麗花', emoji: '<:Reika2:1139201798100488253>' },
    { name: '水瀬伊織', emoji: '<:Iori_China:1139199811447435366>' },
    { name: '大神環', emoji: '<:Tamaki__:1139200790775468143>' },
    { name: '宮尾美也', emoji: '<:Miya_China:1139200711930958028>' },
    { name: '所恵美', emoji: '<:Megumi2:1139235634729463808>' },
    { name: '福田のり子', emoji: '<:Noriko__:1139236368485195797>' },
    { name: '桜守歌織', emoji: '<:Kaori:1139199691939135518>' },
    { name: '高槻やよい', emoji: '<:Yayoi_Pop:1139198746861781102>' },
    { name: '佐竹美奈子', emoji: '<:Minako_China:1139200571740540948>' },
    { name: '七尾百合子', emoji: '<:Yuriko_Mochi:1139199485281583194>' },
    { name: 'ロコ', emoji: '<:Loco_Mochi:1139201031482392737>' },
    { name: '箱崎星梨花', emoji: '<:Serika2:1139202181455679598>' },
    { name: '横山奈緒', emoji: '<:Nao__:1139235893706756107>' },
    { name: '徳川まつり', emoji: '<:Matsuri2:1139236306476609626>' },
    { name: 'エミリー', emoji: '<:Emily_Pop:1139199194154934383>' },
  ];
  const checkMillionMemberList = [
    '桜守歌織',
    '馬場このみ',
    '青羽美咲',
    '三浦あずさ',
    '音無小鳥',
    '二階堂千鶴',
  ];
  const targetMessage = client.channels.cache.get(client.channelIdFor235ChatPlace) as TextChannel;

  BirthdayForMillionMemberRepository.getMillionMemberBirthdayList(
    todayDateList.todayMonth,
    todayDateList.todayDate,
  )
    .then((birthdayData) => {
      if (birthdayData.length === 0) return;

      switch (birthdayData.length) {
        case 1: {
          // 絵文字探索
          const targetEmoji = millionMemberEmojiList.find(
            (millionMember) => millionMember.name === birthdayData[0].name,
          );

          if (checkMillionMemberList.includes(birthdayData[0].name)) {
            targetMessage
              .send(
                `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[0].name}**さんのお誕生日です！！\nHappy Birthday♪`,
              )
              .catch(() => {});

            setTimeout(() => {
              targetMessage.send(birthdayData[0].img).catch(() => {});

              if (targetEmoji !== undefined) {
                client.celebrateMillionMemberReactionEmoji = targetEmoji.emoji;
              }
            }, 1_000);
          } else {
            targetMessage
              .send(
                `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[0].name}**のお誕生日です！！\nHappy Birthday♪`,
              )
              .catch(() => {});

            setTimeout(() => {
              targetMessage.send(birthdayData[0].img).catch(() => {});

              if (targetEmoji !== undefined) {
                client.celebrateMillionMemberReactionEmoji = targetEmoji.emoji;
              }
            }, 1_000);
          }
          break;
        }

        default: {
          // 絵文字探索
          const targetMillionMemberNameList = [birthdayData[0].name, birthdayData[1].name];

          const targetEmojiList = millionMemberEmojiList.filter((millionMember) =>
            targetMillionMemberNameList.includes(millionMember.name),
          );

          let birthdayIndex = 0;

          const birthdayTimer = setInterval(() => {
            switch (birthdayIndex) {
              case birthdayData.length:
                clearInterval(birthdayTimer);
                break;

              case 0:
                targetMessage
                  .send(
                    `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[birthdayIndex].name}**のお誕生日です！！\nHappy Birthday♪`,
                  )
                  .catch(() => {});

                setTimeout(() => {
                  targetMessage.send(birthdayData[birthdayIndex].img).catch(() => {});

                  client.celebrateMillionMemberReactionEmoji = getTargetEmoji(
                    targetEmojiList,
                    birthdayData[birthdayIndex].name,
                  );

                  birthdayIndex += 1;
                }, 1_000);

                break;

              default: {
                targetMessage
                  .send(
                    // eslint-disable-next-line no-irregular-whitespace
                    `さらに！！　本日は**${birthdayData[birthdayIndex].name}**のお誕生日でもあります！！\nHappy Birthday♪`,
                  )
                  .catch(() => {});

                setTimeout(() => {
                  targetMessage.send(birthdayData[birthdayIndex].img).catch(() => {});

                  client.celebrateMillionMemberReactionEmoji = getTargetEmoji(
                    targetEmojiList,
                    birthdayData[birthdayIndex].name,
                  );

                  birthdayIndex += 1;
                }, 1_000);

                break;
              }
            }
          }, 6_000);
          break;
        }
      }
    })
    .catch(() => {});
};
