const { Client, Message } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const DiscordBot = require('../DiscordBot').default;
const { BirthdayFor235Member, BirthdayForMillionMember, DeleteMessage } = require('../../../models/index');

/**
 * 常時行う処理クラス
 */
export default class Ready {
  private discordBot: typeof DiscordBot;

  private readonly anniversaryDataFor235Production = {
    name: '『アイドルマスター ミリオンライブ！ シアターデイズ』',
    year: 2017,
    month: 6,
    date: 29,
  };

  private readonly anniversaryDataForMillionLive = {
    name: '235プロダクション',
    year: 2020,
    month: 12,
    date: 24,
  };

  private readonly commandList = [
    { name: '235birthday', description: '毎月開催されるオンライン飲み会の企画文章を作成したいときに使用するコマンドです。' },
    { name: '235men', description: '毎月開催される235士官学校🌹の日程を決めるときに使用するコマンドです。' },
    { name: '235roomdivision', description: 'ボイスチャンネルに参加しているメンバーを分けたいときに使用するコマンドです。' },
  ];

  private readonly millionMemberEmojiList = [
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

  private readonly checkMillionMemberList = [
    '桜守歌織',
    '馬場このみ',
    '青羽美咲',
    '三浦あずさ',
    '音無小鳥',
    '二階堂千鶴',
  ];

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * ready メイン処理
   *
   * @return {void}
   */
  public readyEvent(): void {
    this.discordBot.on('ready', () => {
      this.setCommand();
      this.setStatus();

      if (
        this.discordBot.channels.cache.get(this.discordBot.channelIdFor235ChatPlace) === undefined
      ) return;

      cron.schedule('0 15 0 * * *', () => this.deleteOldMessageFrom235ChatPlaceChannel(this.discordBot));
      cron.schedule('0 0 0 * * *', () => this.celebrate235Member(this.discordBot));
      cron.schedule('0 30 0 * * *', () => this.celebrateMillionMember(this.discordBot));
      cron.schedule('0 0 1 * * *', () => this.celebrate235ProductionAnniversary(this.discordBot));
      cron.schedule('0 0 1 * * *', () => this.celebrateMillionLiveAnniversary(this.discordBot));
      cron.schedule('0 15 1 * * *', () => this.send235MemberBirthdayListToUtatane(this.discordBot));
      cron.schedule('0 0 14 * * *', () => process.exit());
    });
  }

  /**
   * 235botのコマンドを設定
   * これをすることによって、スラッシュコマンドを使用する時に、235botのコマンドがすぐに出てくるようになる。
   *
   * @return {void}
   */
  private setCommand(): void {
    if (this.discordBot.guilds.cache.get(this.discordBot.serverIdFor235) === undefined) return;

    this.discordBot.application.commands.set(this.commandList, this.discordBot.serverIdFor235);
  }

  /**
   * 235botのステータスを設定
   * これを設定することによって、「〇〇をプレイ中」のように表示させることが出来る。
   *
   * @return {void}
   */
  private setStatus(): void {
    this.discordBot.user.setPresence({
      activities: [{ name: 'アイドルマスター ミリオンライブ! シアターデイズ ' }],
      status: 'online',
    });
  }

  /**
   * 9時15分に雑談場（通話外）チャンネルでメッセージ送信して1週間経ったメッセージを削除
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private deleteOldMessageFrom235ChatPlaceChannel(client: typeof Client): void {
    const setTime = new Date();
    setTime.setDate(setTime.getDate() - 7);
    const dateSevenDaysAgo = setTime.getDate();

    DeleteMessage.findDeleteMessages(dateSevenDaysAgo)
      .then((foundData: { message_id: string, date: number }[]) => {
        if (foundData.length === 0) return;

        let deleteIndex: number = 0;

        const deleteTimer = setInterval(() => {
          switch (deleteIndex) {
            case foundData.length:
              clearInterval(deleteTimer);
              break;

            default:
              client.channels.cache.get(
                this.discordBot.channelIdFor235ChatPlace,
              ).messages.fetch(foundData[deleteIndex].message_id)
                .then(async (foundMessage: typeof Message) => {
                  foundMessage.delete();

                  await DeleteMessage.deleteMessage(foundData[deleteIndex].message_id);

                  deleteIndex += 1;
                })
                .catch(() => console.log('message is deleted.'));
              break;
          }
        }, 5_000);
      });
  }

  /**
   * 9時に235プロダクションのメンバーの誕生日をお祝い
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrate235Member(client: typeof Client): void {
    const todayDateList: {
      todayYear: number,
      todayMonth: number,
      todayDate: number,
      todayHour: number,
      todayMin: number,
    } = Ready.getTodayDateList();

    BirthdayFor235Member.get235MemberBirthdayList(
      this.discordBot.userIdForMaki,
      todayDateList.todayMonth,
      todayDateList.todayDate,
    )
      .then((birthdayData: { name: string, user_id: string, month: number, date: number }[]) => {
        if (birthdayData.length === 0) return;

        switch (birthdayData.length) {
          case 1:
            client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send(`本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[0].name}さん**のお誕生日です！！\n${birthdayData[0].name}さん、お誕生日おめでとうございます♪`);

            this.discordBot.isReactionCelebrate235MemberMessage = false;
            break;

          default: {
            let birthdayIndex: number = 0;

            const birthdayTimer = setInterval(() => {
              switch (birthdayIndex) {
                case birthdayData.length:
                  clearInterval(birthdayTimer);
                  break;

                case 0:
                  client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send(`本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[birthdayIndex].name}さん**のお誕生日です！！\n${birthdayData[birthdayIndex].name}さん、お誕生日おめでとうございます♪`);

                  this.discordBot.isReactionCelebrate235MemberMessage = false;
                  birthdayIndex += 1;
                  break;

                default:
                  client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send(`さらに！！　本日は**${birthdayData[birthdayIndex].name}さん**のお誕生日でもあります！！\n${birthdayData[birthdayIndex].name}さん、お誕生日おめでとうございます♪`);

                  this.discordBot.isReactionCelebrate235MemberMessage = false;
                  birthdayIndex += 1;
                  break;
              }
            }, 4_000);
            break;
          }
        }
      });
  }

  /**
   * 9時半にミリオンメンバーの誕生日をお祝い
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrateMillionMember(client: typeof Client): void {
    const todayDateList: {
      todayYear: number,
      todayMonth: number,
      todayDate: number,
      todayHour: number,
      todayMin: number,
    } = Ready.getTodayDateList();

    BirthdayForMillionMember.getMillionMemberBirthdayList(
      todayDateList.todayMonth,
      todayDateList.todayDate,
    )
      .then((birthdayData: { name: string, month: number, date: number, img: string }[]) => {
        if (birthdayData.length === 0) return;

        switch (birthdayData.length) {
          case 1: {
            // 絵文字探索
            const targetEmoji: string = this.millionMemberEmojiList.find((millionMember: {
              name: string,
              emoji: string,
            }) => millionMember.name === birthdayData[0].name)!.emoji;

            if (this.checkMillionMemberList.includes(birthdayData[0].name)) {
              client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send({ content: `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[0].name}**さんのお誕生日です！！\nHappy Birthday♪`, files: [`data/${birthdayData[0].img}`] });

              this.discordBot.celebrateMillionMemberReactionEmoji = targetEmoji;
            } else {
              client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send({ content: `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[0].name}**のお誕生日です！！\nHappy Birthday♪`, files: [`data/${birthdayData[0].img}`] });

              this.discordBot.celebrateMillionMemberReactionEmoji = targetEmoji;
            }
            break;
          }

          default: {
            // 絵文字探索
            const targetMillionMemberNameList: string[] = [
              birthdayData[0].name,
              birthdayData[1].name,
            ];

            const targetEmojiList: string[] = this.millionMemberEmojiList.filter((millionMember: {
              name: string,
              emoji: string
            }) => targetMillionMemberNameList.includes(millionMember.name))
              .map((millionMember: { name: string, emoji: string }) => millionMember.emoji);

            let birthdayIndex: number = 0;

            const birthdayTimer = setInterval(() => {
              switch (birthdayIndex) {
                case birthdayData.length:
                  clearInterval(birthdayTimer);
                  break;

                case 0:
                  client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send({ content: `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日は**${birthdayData[birthdayIndex].name}**のお誕生日です！！\nHappy Birthday♪`, files: [`data/${birthdayData[birthdayIndex].img}`] });

                  this.discordBot.celebrateMillionMemberReactionEmoji = targetEmojiList[
                    birthdayIndex
                  ];

                  birthdayIndex += 1;
                  break;

                default: {
                  client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send({ content: `さらに！！　本日は**${birthdayData[birthdayIndex].name}**のお誕生日でもあります！！\nHappy Birthday♪`, files: [`data/${birthdayData[birthdayIndex].img}`] });

                  this.discordBot.celebrateMillionMemberReactionEmoji = targetEmojiList[
                    birthdayIndex
                  ];

                  birthdayIndex += 1;
                  break;
                }
              }
            }, 4_000);
            break;
          }
        }
      });
  }

  /**
   * 10時に周年祝い（235プロダクション）
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrate235ProductionAnniversary(client: typeof Client): void {
    const todayDateList: {
      todayYear: number,
      todayMonth: number,
      todayDate: number,
      todayHour: number,
      todayMin: number,
    } = Ready.getTodayDateList();

    if (
      (todayDateList.todayMonth !== this.anniversaryDataFor235Production.month)
      || (todayDateList.todayDate !== this.anniversaryDataFor235Production.date)
    ) return;

    client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send(`本日${todayDateList.todayMonth}月${todayDateList.todayDate}日で**${this.anniversaryDataFor235Production.name}**が設立されて**${Number(todayDateList.todayYear - this.anniversaryDataFor235Production.year)}年**が経ちました！！\nHappy Birthday♪　これからも235プロがずっと続きますように♪`);
  }

  /**
   * 10時に周年祝い（ミリオンライブ）
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private celebrateMillionLiveAnniversary(client: typeof Client): void {
    const todayDateList: {
      todayYear: number,
      todayMonth: number,
      todayDate: number,
      todayHour: number,
      todayMin: number,
    } = Ready.getTodayDateList();

    if (
      (todayDateList.todayMonth !== this.anniversaryDataForMillionLive.month)
      || (todayDateList.todayDate !== this.anniversaryDataForMillionLive.date)
    ) return;

    client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace).send(`本日${todayDateList.todayMonth}月${todayDateList.todayDate}日で**${this.anniversaryDataForMillionLive.name}**は**${Number(todayDateList.todayYear - this.anniversaryDataForMillionLive.year)}周年**を迎えます！！\nHappy Birthday♪　アイマス最高！！！`);
  }

  /**
   * 毎月1日にうたたねさんに235プロダクションメンバーの誕生日リストをDMで送る
   *
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private send235MemberBirthdayListToUtatane(client: typeof Client): void {
    const todayDateList: {
      todayYear: number,
      todayMonth: number,
      todayDate: number,
      todayHour: number,
      todayMin: number,
    } = Ready.getTodayDateList();

    if (todayDateList.todayMonth !== 1) return;

    let text: string = '名前,誕生日\n';
    const csvPath = '../../../data/csv/birthday_for_235_members.csv';

    fs.writeFileSync(csvPath, text);

    BirthdayFor235Member.get235MemberBirthdayListforCSV()
      .then((memberList: { name: string, month: number, date: number }[]) => {
        memberList.forEach((member: { name: string, month: number, date: number }) => {
          text += `${member.name}さん,${member.month}月${member.date}日\n`;

          fs.writeFileSync(csvPath, text);
        });
      });

    client.users.cache.get(this.discordBot.userIdForUtatane).send({
      content: 'お疲れ様です！新しい月が始まりましたね！\n235プロダクションメンバーの誕生日リストをお送りします！\nもし追加されていないメンバー、もしくはすでに退出されたメンバーの誕生日がまだ追加されていた場合は報告をお願いします！',
      files: [{
        attachment: csvPath,
        name: 'birthday_for_235_members.csv',
      }],
    });
  }

  /**
   * 現在日時を取得
   *
   * @return {object}
   */
  private static getTodayDateList(): {
    todayYear: number,
    todayMonth: number,
    todayDate: number,
    todayHour: number,
    todayMin: number,
  } {
    const today = new Date();

    return {
      todayYear: today.getFullYear(),
      todayMonth: today.getMonth() + 1,
      todayDate: today.getDate(),
      todayHour: today.getHours(),
      todayMin: today.getMinutes(),
    };
  }
}
