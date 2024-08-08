const {
  Message,
  Client,
  GuildMember,
  EmbedBuilder,
} = require('discord.js');

const { default: axios } = require('axios');

const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
} = require('@discordjs/voice');

const fs = require('fs');
const DiscordBot = require('../DiscordBot').default;
const { BirthdayFor235Member, BirthdayForMillionMember, DeleteMessage } = require('../../../models/index').default;

/**
 * メッセージが送信された時に行う処理クラス
 */
export default class MessageCreate {
  private discordBot: typeof DiscordBot;

  private readonly prefix = '235';

  private readonly setTimeoutSec = 15_000;

  private readonly maleEventEmojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  private readonly birthday235MemberEmojiList = [
    '<:__:794969172630044674>',
    '<:__:794969688982552607>',
  ];

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * messageCreate メイン処理
   *
   * @return {void}
   */
  public messageCreateEvent(): void {
    this.discordBot.on('messageCreate', async (message: typeof Message) => {
      this.reactToUsedMaleEventCommandMessage(message);
      this.reactToBirthday235MemberMessage(message);
      this.reactToBirthdayMillionMemberMessage(message);

      // 235botのメッセージがリプライだった場合、1分後に削除
      if ((message.author.bot) && (message.mentions.repliedUser)) {
        setTimeout(() => message.delete(), 60_000);
      }

      this.storeMessage(message, this.discordBot);

      // botからのメッセージは無視
      if (message.author.bot) return;

      // chatgpt用

      await this.readTextForVoiceVox(this.discordBot, message);

      // 自己紹介チャンネルから新しく入ったメンバーの誕生日を登録する＆挨拶をする
      if (
        (
          this.discordBot.channels.cache.get(this.discordBot.channelIdFor235Introduction)
          !== undefined
        )
        && (message.channelId === this.discordBot.channelIdFor235Introduction)
      ) {
        // 誕生日を登録
        this.registNew235MemberBirthday(message, this.discordBot);

        // 挨拶
        message.react('<:_Stmp_Tsubasa:794969154817753088>');
        message.reply(`${message.author.globalName}さん、235プロダクションへようこそ！\nこれからもよろしくおねがいします♪`);
        this.discordBot.users.cache.get(this.discordBot.userIdForMaki).send(`${message.author.globalName}さんが新しく235プロダクションに参加されました！`);
      }

      // コマンドメッセージ以外は無視
      if (!message.content.startsWith(this.prefix)) return;

      const formattedCommand: string = message.content.slice(this.prefix.length);

      // 235しか入力されていなかった場合は無視
      if (formattedCommand === '') return;

      // コマンドと引数を配列で取得
      const commandList: string[] = formattedCommand.split(' ');
      // コマンドを取得
      const commandName: string = commandList.shift()!.toLowerCase();

      this.helpCommand(message, commandName);
      this.birthdayEventCommand(message, commandName, commandList);
      this.menEventCommand(message, commandName, commandList);
      this.roomDivisionCommand(this.discordBot, message, commandName);
      await this.joinVoiceChannelCommand(message, commandName);
      await this.disconnectVoiceChannelCommand(message, commandName);
      this.testCommand(message, commandName, commandList);
    });
  }

  /**
   * イベント企画で作成した文章にアクション
   *
   * @param {Message} message Messageクラス
   *
   * @return {void}
   */
  private reactToUsedMaleEventCommandMessage(message: typeof Message): void {
    if (this.discordBot.usedMaleEventCommandReactionCount === 0) return;

    for (let i = 0; i < this.discordBot.usedMaleEventCommandReactionCount; i += 1) {
      message.react(this.maleEventEmojiList[i]);
    }

    this.discordBot.usedMaleEventCommandReactionCount = 0;
  }

  /**
   * 235メンバーの誕生日をお祝いしてるメッセージにアクション
   *
   * @param {Message} message Messageクラス
   *
   * @return {void}
   */
  private reactToBirthday235MemberMessage(message: typeof Message): void {
    if (this.discordBot.isReactionCelebrate235MemberMessage) return;

    this.birthday235MemberEmojiList.forEach((emoji: string) => message.react(emoji));

    this.discordBot.isReactionCelebrate235MemberMessage = true;
  }

  /**
   * ミリオンメンバーの誕生日をお祝いしてるメッセージにアクション
   *
   * @param {Message} message Messageクラス
   *
   * @return {void}
   */
  private reactToBirthdayMillionMemberMessage(message: typeof Message): void {
    if (this.discordBot.celebrateMillionMemberReactionEmoji === '') return;

    message.react(this.discordBot.celebrateMillionMemberReactionEmoji);

    this.discordBot.celebrateMillionMemberReactionEmoji = '';
  }

  /**
   * 雑談場（通話外）の235botのリプライじゃないメッセージを保存（１週間後に消すため）
   *
   * @param {Message} message Messageクラス
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private storeMessage(message: typeof Message, client: typeof Client): void {
    if (client.channels.cache.get(this.discordBot.channelIdFor235ChatPlace) === undefined) return;
    if (
      (message.channelId !== this.discordBot.channelIdFor235ChatPlace)
      || (message.author.bot === false)
      || (message.mentions.repliedUser !== null)
    ) return;

    const today = new Date();
    const storeDate = today.getDate();

    DeleteMessage.storeMessage(message.id, storeDate)
      .then(() => console.log('新しいメッセージを delete_messages テーブルに登録しました！'));

    this.discordBot.isUpdatedDatabase = true;
  }

  /**
   * テキストを読み上げる
   *
   * @param {Client} client Clientクラス
   * @param {Message} message Messageクラス
   *
   * @return {void}
  */
  private async readTextForVoiceVox(client: typeof Client, message: typeof Message) {
    if ((client.connection === undefined) || (message.content.startsWith(this.prefix))) return;

    const readChannelIdList = [
      client.connection.joinConfig.channelId,
    ];

    const readTextChannelList = [
      {
        voiceChannelId: this.discordBot.voiceChannelIdFor235ChatPlace,
        channelId: this.discordBot.channelIdFor235ListenOnly,
      },
      {
        voiceChannelId: this.discordBot.voiceChannelIdFor235ChatPlace2,
        channelId: this.discordBot.channelIdFor235ListenOnly2,
      },
    ];

    const sentChannelId = readTextChannelList.find((data) => {
      return data.voiceChannelId === client.connection.joinConfig.channelId;
    });

    if (sentChannelId !== undefined) {
      readChannelIdList.push(sentChannelId.channelId);
    }

    if (!readChannelIdList.includes(message.channelId)) return;

    const filePath = './data/voice';
    const wavFile = `${filePath}/${message.author.id}.wav`;
    // ここは多分後で変える
    const character = '62';

    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

    const readText = MessageCreate.formatMessage(message.content);
    await MessageCreate.generateAudioFile(readText, wavFile, character);
    MessageCreate.play(message, wavFile, client.connection);
  }

  /**
   * 235プロダクションに新しく入ってきた方の誕生日を登録
   *
   * @param {Message} message Messageクラス
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private registNew235MemberBirthday(message: typeof Message, client: typeof Client): void {
    const messageList: string[] = message.content.replace(/\r?\n/g, '').split(/：|・/);
    const foundIndex: number = messageList.indexOf('生年月日');

    if (foundIndex === -1) return;

    const birthdayList: string[] = messageList[foundIndex + 1].split(/年|月|\//).map((data) => data.match(/\d+/g)![0].replace(/^0+/, ''));

    if (birthdayList.length === 3) {
      birthdayList.shift();
    }

    BirthdayFor235Member.registNew235MemberBirthday(
      message.author.globalName,
      message.author.id,
      birthdayList[0],
      birthdayList[1],
    )
      .then(() => {
        client.users.cache.get(this.discordBot.userIdForMaki).send(`${message.author.globalName}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日`);
        client.users.cache.get(this.discordBot.userIdForUtatane).send(`${message.author.globalName}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日\nもし間違いがあった場合は報告をお願いします！`);

        this.discordBot.isUpdatedDatabase = true;
      });
  }

  /**
   * 235helpコマンド 235botの機能一覧を教える
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   *
   * @return {void}
   */
  private helpCommand(message: typeof Message, commandName: string): void {
    if (commandName !== 'help') return;

    switch (message.author.id) {
      case this.discordBot.userIdForUtatane:
        message.reply('235botは以下のようなコマンドを使用することが出来ます。\n\n・235birthday\n\n・235men\n\n・235roomdivision\n\n各コマンドの機能の詳細を知りたい場合は、スラッシュコマンド **/** を使って知りたい機能を選択してください。');

        setTimeout(() => {
          message.delete()
            .then(() => console.log('message deleting.'))
            .catch(() => console.log('message is deleted.'));
        }, this.setTimeoutSec);
        break;

      default:
        message.reply('235botは以下のようなコマンドを使用することが出来ます。\n\n・235roomdivision\n\n各コマンドの機能の詳細を知りたい場合は、スラッシュコマンド **/** を使って知りたい機能を選択してください。');

        setTimeout(() => {
          message.delete()
            .then(() => console.log('message deleting.'))
            .catch(() => console.log('message is deleted.'));
        }, this.setTimeoutSec);
        break;
    }
  }

  /**
   * 235birthdayコマンド 毎月の誕生日祝い企画文章を作成
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   * @param {string[]} commandList 引数一覧
   *
   * @return {void}
   */
  private birthdayEventCommand(
    message: typeof Message,
    commandName: string,
    commandList: string[],
  ): void {
    if ((commandName !== 'birthday') || (message.author.id !== this.discordBot.userIdForUtatane)) return;

    if ((commandList.length < 3) || (commandList.length > 4)) {
      message.reply('235birthdayコマンドを使う場合、birthdayの後にオンライン飲み会を開催したい月、日、時間 （半角数字のみ、曜日は不要） の3つを入力してください。\n任意のテキストを追加したい場合は、3つ入力した後に、追加したいテキストを入力してください。\n※半角スペースで区切るのを忘れずに！！\n\n235birthday 8 15 21');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    let isAllInt: boolean = true;

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
      message.reply('半角数字以外が含まれています！\n月、日、時間は全て**半角数字のみ**で入力してください！');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if ((Number(commandList[0]) < 1) || (Number(commandList[0]) > 12)) {
      message.reply('月は1～12の間で入力してください！');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    const today = new Date();
    const lastDatetime = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    // 今月末日を取得
    const lastDate = lastDatetime.getDate();

    if ((Number(commandList[1]) < 1) || (Number(commandList[1]) > lastDate)) {
      message.reply(`日は1～${lastDate}の間で入力してください！`);

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if ((Number(commandList[2]) < 0) || (Number(commandList[2]) > 23)) {
      message.reply('時間は0～23の間で入力してください！');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    const todayYear = today.getFullYear();
    const eventDatetime = new Date(todayYear, Number(commandList[0]) - 1, Number(commandList[1]));
    const eventDay = eventDatetime.getDay();

    const week = [
      '日曜日',
      '月曜日',
      '火曜日',
      '水曜日',
      '木曜日',
      '金曜日',
      '土曜日',
    ];

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

    let eventText: string = `@everyone\n${textList[0][Math.floor(Math.random() * textList[0].length)]}`;

    BirthdayFor235Member.getThisMonthBirthdayMember(commandList[0])
      .then((birthdayMemberList: {
        name: string,
        user_id: string,
        month: number,
        date: number,
      }[]) => {
        birthdayMemberList.forEach((birthdayMember) => {
          eventText += `**${birthdayMember.date}日...${birthdayMember.name}さん**\n`;
        });

        eventText += textList[1][Math.floor(Math.random() * textList[1].length)];

        eventText += `\n\n**開催日：${commandList[0]}月${commandList[1]}日 （${week[eventDay]}）**\n**時間：${commandList[2]}時ごろ～眠くなるまで**\n**場所：ラウンジDiscord雑談通話**\n**持参品：**:shaved_ice::icecream::ice_cream::cup_with_straw::champagne_glass::pizza::cookie:\n\n`;

        eventText += textList[2][Math.floor(Math.random() * textList[2].length)];

        if (commandList.length === 4) {
          eventText += `\n${commandList[3]}`;
        }

        message.channel.send(eventText);

        setTimeout(() => message.reply('うたたねさん、今回もお疲れ様です！\nいつもありがとうございます♪'), 6_000);

        setTimeout(() => {
          message.delete()
            .then(() => console.log('message deleting.'))
            .catch(() => console.log('message is deleted.'));
        }, this.setTimeoutSec);
      });
  }

  /**
   * 235menコマンド 男子会の日程を決める文章を作成
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   * @param {string[]} commandList 引数一覧
   *
   * @return {void}
   */
  private menEventCommand(
    message: typeof Message,
    commandName: string,
    commandList: string[],
  ): void {
    if ((commandName !== 'men') || (message.author.id !== this.discordBot.userIdForUtatane)) return;

    if ((commandList.length < 1) || (commandList.length > 10)) {
      message.reply('235menコマンドは、235士官学校の日程を決めるために使用するコマンドです。\n開校したい日程を**半角スペースで区切って**入力してください。（半角数字のみ、月、曜日などは不要）\n入力できる日程の数は**2～10個まで**です！\n\n235men 8 12 15 21');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    const isAllInt: boolean = commandList.every((date) => (Number.isInteger(Number(date))));

    if (!isAllInt) {
      message.reply('半角数字以外が含まれています！\n日程は**半角数字のみ**で入力してください！');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (MessageCreate.isExistsSameValue(commandList)) {
      message.reply('同じ日程が入力されています！');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    const today = new Date();
    const lastDatetime = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    // 今月末日を取得
    const lastDate = lastDatetime.getDate();

    const isValidDate: boolean = commandList.every(
      (date) => ((Number(date) >= 1) && (Number(date) <= lastDate)),
    );

    if (!isValidDate) {
      message.reply(`日は1～${lastDate}の間で入力してください！`);

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    commandList.sort((a, b) => Number(a) - Number(b));

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const eventDayList = commandList.map(
      (date) => new Date(todayYear, todayMonth - 1, Number(date)).getDay(),
    );

    const week = [
      '日曜日',
      '月曜日',
      '火曜日',
      '水曜日',
      '木曜日',
      '金曜日',
      '土曜日',
    ];

    const textList = [
      [
        `ふみこ男子の皆様方～～～～～～～～～～～！${todayMonth}月期の235士官学校開校日を決めたいと思いますわ～～～～～！！！日程なんですけど、\n\n`,
        `ふみこ男子の皆様方～～～～～～～～～！${todayMonth}月期の235士官学校開校日を決めたいと思います！その日程なんですけど、\n\n`,
      ],
      [
        '\n誠に勝手ながらこのいずれかの日程でやろうと思いますので、スタンプで反応を頂けると嬉しいです～～～～ふみこ男子の皆様方！よろしくおねがいしますわね！！！！！！！！！ﾍｹｯ!!!!!!!!',
        '\n真に勝手ながらこのいずれかにしようと思いますので、2~3日中にスタンプで反応を頂けると幸いです！よろしくお願いしま～～～～～～～す🙏',
      ],
    ];

    let eventText: string = `@everyone\n${textList[0][Math.floor(Math.random() * textList[0].length)]}`;

    for (let i = 0; i < commandList.length; i += 1) {
      eventText += `**${todayMonth}月${commandList[i]}日 （${week[eventDayList[i]]}）…　${this.maleEventEmojiList[i]}**\n`;
    }

    eventText += textList[1][Math.floor(Math.random() * textList[1].length)];

    message.channel.send(eventText);

    this.discordBot.usedMaleEventCommandReactionCount = commandList.length;

    setTimeout(() => message.reply('うたたねさん、今回もお疲れ様です！\nいつもありがとうございます♪'), 6_000);

    setTimeout(() => {
      message.delete()
        .then(() => console.log('message deleting.'))
        .catch(() => console.log('message is deleted.'));
    }, this.setTimeoutSec);
  }

  /**
   * 235roomdivisionコマンド ボイスチャンネルに参加しているメンバーを分ける
   *
   * @param {Client} client Clientクラス
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   *
   * @return {void}
   */
  private roomDivisionCommand(
    client: typeof Client,
    message: typeof Message,
    commandName: string,
  ): void {
    if (commandName !== 'roomdivision') return;

    let participatingVoiceChannelMemberList: {
      userName: string,
      userId: string,
    }[] = client.voice.client.channels.cache.get(
      this.discordBot.voiceChannelIdFor235ChatPlace,
    ).members
      .filter((member: typeof GuildMember) => member.user.bot === false)
      .map((member: typeof GuildMember) => {
        return {
          userName: member.user.globalName,
          userId: member.user.id,
        };
      });

    const isParticipateVoiceChannelUsedCommandMember: boolean = participatingVoiceChannelMemberList
      .some((participatingVoiceChannelMember: {
        userName: string,
        userId: string,
      }) => participatingVoiceChannelMember.userId === message.author.id);

    if (!isParticipateVoiceChannelUsedCommandMember) {
      message.reply('235roomdivision コマンドは、【雑談１】ボイスチャンネルに参加しているメンバーが使用できるコマンドです。');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (participatingVoiceChannelMemberList.length < 10) {
      message.reply('【雑談１】ボイスチャンネルに参加しているメンバーの人数が10人未満のため、分けることが出来ません！');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    message.channel.sendTyping();

    let halfIndex: number = 0;
    let halfIndex2: number = 0;

    // 配列を分ける
    if (participatingVoiceChannelMemberList.length % 2 === 0) {
      halfIndex = Math.floor(participatingVoiceChannelMemberList.length / 2) - 1;
      halfIndex2 = participatingVoiceChannelMemberList.length - halfIndex - 1;
    } else {
      halfIndex = Math.floor(participatingVoiceChannelMemberList.length / 2);
      halfIndex2 = participatingVoiceChannelMemberList.length - halfIndex;
    }

    let duplicationCount: number = 100;
    let halfMemberList: { userName: string, userId: string }[] = [];
    let halfMemberList2: { userName: string, userId: string }[] = [];

    while (duplicationCount >= 3) {
      // 初期化
      participatingVoiceChannelMemberList = MessageCreate.shuffle(
        participatingVoiceChannelMemberList,
      );

      halfMemberList = [];
      halfMemberList2 = [];

      for (let i = 0; i <= halfIndex; i += 1) {
        halfMemberList.push(participatingVoiceChannelMemberList[i]);
      }

      for (let i = halfIndex2; i < participatingVoiceChannelMemberList.length; i += 1) {
        halfMemberList2.push(participatingVoiceChannelMemberList[i]);
      }

      // 3人以上被ってないかチェック
      duplicationCount = halfMemberList2.filter((participatingVoiceChannelMember: {
        userName: string,
        userId: string,
      }) => {
        return this.discordBot.dividedUserIdList.indexOf(
          participatingVoiceChannelMember.userId,
        ) !== -1;
      }).length;
    }

    // 2個目の配列のメンバーを雑談２ボイスチャンネルに移動
    const dividedUserNameList = halfMemberList.map((dividedMember: {
      userName: string,
      userId: string,
    }) => dividedMember.userName);

    const dividedUserNameList2 = halfMemberList2.map((dividedMember: {
      userName: string,
      userId: string,
    }) => dividedMember.userName);

    const dividedUserIdList2 = halfMemberList2.map((dividedMember: {
      userName: string,
      userId: string,
    }) => dividedMember.userId);

    this.discordBot.dividedUserIdList = dividedUserIdList2;

    setTimeout(() => message.reply(`このような結果になりました！\n\n**【雑談１】**\n------------------------------------------------------------\n${dividedUserNameList.join('\n')}\n------------------------------------------------------------\n\n**【雑談２】**\n------------------------------------------------------------\n${dividedUserNameList2.join('\n')}\n------------------------------------------------------------\n\n自動で分けられますのでしばらくお待ちください。`), 2_000);

    setTimeout(() => {
      let divisionCount: number = 0;

      const roomDivideTimer = setInterval(() => {
        switch (divisionCount) {
          case halfMemberList2.length:
            message.delete()
              .then(() => console.log('message deleting.'))
              .catch(() => console.log('message is deleted.'));
            clearInterval(roomDivideTimer);
            break;

          default:
            client.guilds.cache.get(this.discordBot.serverIdFor235).members
              .fetch(dividedUserIdList2[divisionCount])
              .then((member: typeof GuildMember) => member.voice.setChannel(
                this.discordBot.voiceChannelIdFor235ChatPlace2,
              ));

            divisionCount += 1;
            break;
        }
      }, 1_000);
    }, 9_000);
  }

  /**
   * 235joinコマンド コマンドを入力したメンバーが入っているボイスチャンネルに参加
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   *
   * @return {void}
   */
  private async joinVoiceChannelCommand(message: typeof Message, commandName: string) {
    if (commandName !== 'join') return;

    const usedCommandMember = await message.guild.members.fetch(message.author.id);
    const memberJoinVoiceChannel = usedCommandMember.voice.channel;

    if (
      (this.discordBot.connection !== undefined)
      && (this.discordBot.connection.joinConfig.channelId === memberJoinVoiceChannel.id)
    ) {
      const embed = new EmbedBuilder()
        .setTitle('既に接続されています！')
        .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
        .setColor('#FF0000')
        .setTimestamp();

      message.reply({ embeds: [embed] });

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (memberJoinVoiceChannel === null) {
      message.reply('235joinコマンドを使用することで、使用したメンバーが参加しているボイスチャンネルに235botが参加して、そのボイスチャンネルの聞き専チャンネルに投稿されたテキストを読み上げます！\nボイスチャンネルに参加してから再度このスラッシュコマンドを使用していただくか、もしくはテキストで「235join」と入力していただければボイスチャンネルに参加します！');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (!memberJoinVoiceChannel.joinable || !memberJoinVoiceChannel.speakable) {
      message.reply('参加先のボイスチャンネルに接続できなかったか、もしくは参加先のボイスチャンネルで音声を再生する権限がありませんでした；；');

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    this.discordBot.connection = joinVoiceChannel({
      channelId: memberJoinVoiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: true,
    });

    const embed = new EmbedBuilder()
      .setTitle('接続されました！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
      .setColor('#00FF99')
      .setTimestamp();

    message.reply({ embeds: [embed] });

    setTimeout(() => {
      message.delete()
        .then(() => console.log('message deleting.'))
        .catch(() => console.log('message is deleted.'));
    }, this.setTimeoutSec);
  }

  /**
   * 235disconnectコマンド 235botをボイスチャンネルから切断
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   *
   * @return {void}
   */
  private async disconnectVoiceChannelCommand(message: typeof Message, commandName: string) {
    if (commandName !== 'disconnect') return;

    const usedCommandMember = await message.guild.members.fetch(message.author.id);
    const memberJoinVoiceChannel = usedCommandMember.voice.channel;

    if (this.discordBot.connection === undefined) {
      const embed = new EmbedBuilder()
        .setTitle('まだボイスチャンネルに接続されていません！')
        .setColor('#FF0000')
        .setTimestamp();

      message.reply({ embeds: [embed] });

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (
      (memberJoinVoiceChannel === null)
      || (this.discordBot.connection.joinConfig.channelId !== memberJoinVoiceChannel.id)
    ) {
      const embed = new EmbedBuilder()
        .setTitle('切断できるのは235botが入っているボイスチャンネルに参加しているメンバーだけです！')
        .setColor('#FFCC00')
        .setTimestamp();

      message.reply({ embeds: [embed] });

      setTimeout(() => {
        message.delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    this.discordBot.connection.destroy();
    this.discordBot.connection = undefined;

    const embed = new EmbedBuilder()
      .setTitle('切断されました！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
      .setColor('#00FF99')
      .setTimestamp();

    message.reply({ embeds: [embed] });

    setTimeout(() => {
      message.delete()
        .then(() => console.log('message deleting.'))
        .catch(() => console.log('message is deleted.'));
    }, this.setTimeoutSec);
  }

  /**
   * 235testコマンド 新しい機能を追加する時に実験とかする用
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   * @param {string[]} commandList 引数一覧
   *
   * @return {void}
   */
  private testCommand(message: typeof Message, commandName: string, commandList: string[]): void {
    if ((commandName !== 'test') || (message.author.id !== this.discordBot.userIdForMaki) || (commandList.length === 0)) return;

    switch (commandList[0]) {
      case 'birthday_for_235_members':
        BirthdayFor235Member.findAll({ raw: true }).then((member: {
          name: string,
          user_id: string,
          month: number,
          date: number,
        }[]) => console.log(member));

        break;
      case 'birthday_for_million_members':
        BirthdayForMillionMember.findAll({ raw: true }).then((member: {
          name: string,
          month: number,
          date: number,
          img: string,
        }[]) => console.log(member));

        break;
      case 'delete_messages':
        DeleteMessage.findAll({ raw: true }).then((data: {
          message_id: string,
          date: number,
        }[]) => console.log(data));

        break;
    }

    setTimeout(() => {
      message.delete()
        .then(() => console.log('message deleting.'))
        .catch(() => console.log('message is deleted.'));
    }, this.setTimeoutSec);
  }

  /**
   * 指定された配列の中に重複している要素があるかチェック
   *
   * @param {string[]} targetList 配列
   *
   * @return {boolean}
   */
  private static isExistsSameValue(targetList: string[]): boolean {
    const set = new Set(targetList);

    return set.size !== targetList.length;
  }

  /**
   * 配列の要素の中身をシャッフル
   *
   * @param {T[]} memberList シャッフル対象のメンバーリスト
   *
   * @return {T[]}
   */
  private static shuffle<T>(memberList: T[]): T[] {
    const out = Array.from(memberList);

    for (let i = out.length - 1; i > 0; i -= 1) {
      const r = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[r];
      out[r] = tmp;
    }

    return out;
  }

  /**
   * 読み上げるテキストの内容をフォーマット（絵文字やURLなどを排除）
   *
   * @param {any} messageContent フォーマット対象のメッセージ
   *
   * @return {string}
   */
  private static formatMessage(messageContent: any): string {
    let formattedMessageContent: string = messageContent;

    formattedMessageContent = formattedMessageContent.replace(/<:[a-zA-Z0-9_]+:[0-9]+>/g, '');
    formattedMessageContent = formattedMessageContent.replace(MessageCreate.emojiRegex(), '');
    formattedMessageContent = formattedMessageContent.replace(/(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g, '');
    formattedMessageContent = formattedMessageContent.replace(/\r?\n/g, '、');

    return formattedMessageContent;
  }

  /**
   * 絵文字の正規表現
   *
   * @return {RegExp}
   */
  private static emojiRegex() {
    return /\u{1F3F4}\u{E0067}\u{E0062}(?:\u{E0077}\u{E006C}\u{E0073}|\u{E0073}\u{E0063}\u{E0074}|\u{E0065}\u{E006E}\u{E0067})\u{E007F}|\u{1F469}\u200D\u{1F469}\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F468}(?:\u{1F3FF}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FE}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FE}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FD}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FC}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FB}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FC}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F468}|[\u{1F468}\u{1F469}]\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}]|[\u{1F468}\u{1F469}]\u200D[\u{1F466}\u{1F467}]|[\u2695\u2696\u2708]\uFE0F|[\u{1F466}\u{1F467}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u{1F3FB}\u200D[\u2695\u2696\u2708])\uFE0F|\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC}|\u{1F3FB})?|\u{1F9D1}(?:[\u{1F3FB}-\u{1F3FF}]\u200D(?:\u{1F91D}\u200D\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u200D(?:\u{1F91D}\u200D\u{1F9D1}|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))|\u{1F469}(?:\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FE}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FD}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FC}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FB}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F469}\u{1F3FF}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FE}]|\u{1F469}\u{1F3FE}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|\u{1F469}\u{1F3FD}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|\u{1F469}\u{1F3FC}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|\u{1F469}\u{1F3FB}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FC}-\u{1F3FF}]|\u{1F469}\u200D\u{1F466}\u200D\u{1F466}|\u{1F469}\u200D\u{1F469}\u200D[\u{1F466}\u{1F467}]|(?:\u{1F441}\uFE0F\u200D\u{1F5E8}|\u{1F469}(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u{1F3FB}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\u{1F3F3}\uFE0F\u200D\u26A7|\u{1F9D1}(?:[\u{1F3FB}-\u{1F3FF}]\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\u{1F43B}\u200D\u2744|(?:[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u{1F46F}\u{1F93C}\u{1F9DE}\u{1F9DF}])\u200D[\u2640\u2642]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\uFE0F\u{1F3FB}-\u{1F3FF}]\u200D[\u2640\u2642]|\u{1F3F4}\u200D\u2620|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D6}-\u{1F9DD}]\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u2764\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299\u{1F170}\u{1F171}\u{1F17E}\u{1F17F}\u{1F202}\u{1F237}\u{1F321}\u{1F324}-\u{1F32C}\u{1F336}\u{1F37D}\u{1F396}\u{1F397}\u{1F399}-\u{1F39B}\u{1F39E}\u{1F39F}\u{1F3CD}\u{1F3CE}\u{1F3D4}-\u{1F3DF}\u{1F3F5}\u{1F3F7}\u{1F43F}\u{1F4FD}\u{1F549}\u{1F54A}\u{1F56F}\u{1F570}\u{1F573}\u{1F576}-\u{1F579}\u{1F587}\u{1F58A}-\u{1F58D}\u{1F5A5}\u{1F5A8}\u{1F5B1}\u{1F5B2}\u{1F5BC}\u{1F5C2}-\u{1F5C4}\u{1F5D1}-\u{1F5D3}\u{1F5DC}-\u{1F5DE}\u{1F5E1}\u{1F5E3}\u{1F5E8}\u{1F5EF}\u{1F5F3}\u{1F5FA}\u{1F6CB}\u{1F6CD}-\u{1F6CF}\u{1F6E0}-\u{1F6E5}\u{1F6E9}\u{1F6F0}\u{1F6F3}])\uFE0F|\u{1F469}\u200D\u{1F467}\u200D[\u{1F466}\u{1F467}]|\u{1F3F3}\uFE0F\u200D\u{1F308}|\u{1F469}\u200D\u{1F467}|\u{1F469}\u200D\u{1F466}|\u{1F415}\u200D\u{1F9BA}|\u{1F469}(?:\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC}|\u{1F3FB})?|\u{1F1FD}\u{1F1F0}|\u{1F1F6}\u{1F1E6}|\u{1F1F4}\u{1F1F2}|\u{1F408}\u200D\u2B1B|\u{1F441}\uFE0F|\u{1F3F3}\uFE0F|\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]?|\u{1F1FF}[\u{1F1E6}\u{1F1F2}\u{1F1FC}]|\u{1F1FE}[\u{1F1EA}\u{1F1F9}]|\u{1F1FC}[\u{1F1EB}\u{1F1F8}]|\u{1F1FB}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1EE}\u{1F1F3}\u{1F1FA}]|\u{1F1FA}[\u{1F1E6}\u{1F1EC}\u{1F1F2}\u{1F1F3}\u{1F1F8}\u{1F1FE}\u{1F1FF}]|\u{1F1F9}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1ED}\u{1F1EF}-\u{1F1F4}\u{1F1F7}\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FF}]|\u{1F1F8}[\u{1F1E6}-\u{1F1EA}\u{1F1EC}-\u{1F1F4}\u{1F1F7}-\u{1F1F9}\u{1F1FB}\u{1F1FD}-\u{1F1FF}]|\u{1F1F7}[\u{1F1EA}\u{1F1F4}\u{1F1F8}\u{1F1FA}\u{1F1FC}]|\u{1F1F5}[\u{1F1E6}\u{1F1EA}-\u{1F1ED}\u{1F1F0}-\u{1F1F3}\u{1F1F7}-\u{1F1F9}\u{1F1FC}\u{1F1FE}]|\u{1F1F3}[\u{1F1E6}\u{1F1E8}\u{1F1EA}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F4}\u{1F1F5}\u{1F1F7}\u{1F1FA}\u{1F1FF}]|\u{1F1F2}[\u{1F1E6}\u{1F1E8}-\u{1F1ED}\u{1F1F0}-\u{1F1FF}]|\u{1F1F1}[\u{1F1E6}-\u{1F1E8}\u{1F1EE}\u{1F1F0}\u{1F1F7}-\u{1F1FB}\u{1F1FE}]|\u{1F1F0}[\u{1F1EA}\u{1F1EC}-\u{1F1EE}\u{1F1F2}\u{1F1F3}\u{1F1F5}\u{1F1F7}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1EF}[\u{1F1EA}\u{1F1F2}\u{1F1F4}\u{1F1F5}]|\u{1F1EE}[\u{1F1E8}-\u{1F1EA}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}]|\u{1F1ED}[\u{1F1F0}\u{1F1F2}\u{1F1F3}\u{1F1F7}\u{1F1F9}\u{1F1FA}]|\u{1F1EC}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EE}\u{1F1F1}-\u{1F1F3}\u{1F1F5}-\u{1F1FA}\u{1F1FC}\u{1F1FE}]|\u{1F1EB}[\u{1F1EE}-\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1F7}]|\u{1F1EA}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1ED}\u{1F1F7}-\u{1F1FA}]|\u{1F1E9}[\u{1F1EA}\u{1F1EC}\u{1F1EF}\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1FF}]|\u{1F1E8}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1EE}\u{1F1F0}-\u{1F1F5}\u{1F1F7}\u{1F1FA}-\u{1F1FF}]|\u{1F1E7}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EF}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1E6}[\u{1F1E8}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F2}\u{1F1F4}\u{1F1F6}-\u{1F1FA}\u{1F1FC}\u{1F1FD}\u{1F1FF}]|[#\*0-9]\uFE0F\u20E3|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\uFE0F\u{1F3FB}-\u{1F3FF}]|\u{1F3F4}|[\u270A\u270B\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F46B}-\u{1F46D}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F4AA}\u{1F57A}\u{1F595}\u{1F596}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F90C}\u{1F90F}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F934}\u{1F936}\u{1F977}\u{1F9B5}\u{1F9B6}\u{1F9BB}\u{1F9D2}-\u{1F9D5}][\u{1F3FB}-\u{1F3FF}]|[\u261D\u270C\u270D\u{1F574}\u{1F590}][\uFE0F\u{1F3FB}-\u{1F3FF}]|[\u270A\u270B\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F408}\u{1F415}\u{1F43B}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F46B}-\u{1F46D}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F4AA}\u{1F57A}\u{1F595}\u{1F596}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F90C}\u{1F90F}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F934}\u{1F936}\u{1F977}\u{1F9B5}\u{1F9B6}\u{1F9BB}\u{1F9D2}-\u{1F9D5}]|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D6}-\u{1F9DD}]|[\u{1F46F}\u{1F93C}\u{1F9DE}\u{1F9DF}]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F201}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F236}\u{1F238}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F37E}-\u{1F384}\u{1F386}-\u{1F393}\u{1F3A0}-\u{1F3C1}\u{1F3C5}\u{1F3C6}\u{1F3C8}\u{1F3C9}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}\u{1F3F8}-\u{1F407}\u{1F409}-\u{1F414}\u{1F416}-\u{1F43A}\u{1F43C}-\u{1F43E}\u{1F440}\u{1F444}\u{1F445}\u{1F451}-\u{1F465}\u{1F46A}\u{1F479}-\u{1F47B}\u{1F47D}-\u{1F480}\u{1F484}\u{1F488}-\u{1F4A9}\u{1F4AB}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F5A4}\u{1F5FB}-\u{1F644}\u{1F648}-\u{1F64A}\u{1F680}-\u{1F6A2}\u{1F6A4}-\u{1F6B3}\u{1F6B7}-\u{1F6BF}\u{1F6C1}-\u{1F6C5}\u{1F6D0}-\u{1F6D2}\u{1F6D5}-\u{1F6D7}\u{1F6EB}\u{1F6EC}\u{1F6F4}-\u{1F6FC}\u{1F7E0}-\u{1F7EB}\u{1F90D}\u{1F90E}\u{1F910}-\u{1F917}\u{1F91D}\u{1F920}-\u{1F925}\u{1F927}-\u{1F92F}\u{1F93A}\u{1F93F}-\u{1F945}\u{1F947}-\u{1F976}\u{1F978}\u{1F97A}-\u{1F9B4}\u{1F9B7}\u{1F9BA}\u{1F9BC}-\u{1F9CB}\u{1F9D0}\u{1F9E0}-\u{1F9FF}\u{1FA70}-\u{1FA74}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA86}\u{1FA90}-\u{1FAA8}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}-\u{1FAD6}]/gu;
  }

  /**
   * 入力されたテキストを読み上げるwavファイルを生成
   *
   * @param {string} readText 読み上げ対象のメッセージ
   * @param {string} wavFile wavファイルの保存先パス
   * @param {string} character
   *
   * @return {void}
   */
  private static async generateAudioFile(readText: string, wavFile: string, character: string) {
    const voiceVox = axios.create({ baseURL: 'http://voicevox-engine:50021/', proxy: false });

    const audioQuery = await voiceVox.post(`audio_query?text=${encodeURI(readText)}&speaker=${character}`, {
      headers: { accept: 'application/json' },
    });

    const synthesis = await voiceVox.post(`synthesis?speaker=${character}`, JSON.stringify(audioQuery.data), {
      responseType: 'arraybuffer',
      headers: {
        accept: 'audio/wav',
        'Content-Type': 'application/json',
      },
    });

    fs.writeFileSync(wavFile, Buffer.from(synthesis.data), 'binary');
  }

  /**
   * 生成したwavファイルを元に読み上げ
   *
   * @param {Message} message Messageクラス
   * @param {string} wavFile 生成したwavファイル
   * @param {any} connection ボイスチャンネルオブジェクト
   *
   * @return {void}
   */
  private static play(message: typeof Message, wavFile: string, connection: any): void {
    const resource = createAudioResource(wavFile, { inputType: StreamType.Arbitrary });
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    player.play(resource);

    connection.subscribe(player);
  }
}
