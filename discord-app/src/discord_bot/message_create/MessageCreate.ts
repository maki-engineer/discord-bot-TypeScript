const { Message, Client } = require('discord.js');
const DiscordBot = require('../DiscordBot').default;
const { BirthdayFor235Member, DeleteMessage } = require('../../../models/index');

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
    this.discordBot.on('messageCreate', (message: typeof Message) => {
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
        message.reply(`${message.author.username}さん、235プロダクションへようこそ！\nこれからもよろしくおねがいします♪`);
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
      this.testCommand(message, commandName);
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
      message.author.username,
      message.author.id,
      birthdayList[0],
      birthdayList[1],
    )
      .then(() => {
        client.users.cache.get(this.discordBot.userIdForMaki).send(`${message.author.username}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日`);
        client.users.cache.get(this.discordBot.userIdForUtatane).send(`${message.author.username}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日\nもし間違いがあった場合は報告をお願いします！`);
      })
      .catch(() => {
        client.users.cache.get(this.discordBot.userIdForMaki).send(`${message.author.username}さんの誕生日を登録できませんでした。`);
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
        message.reply('235botは以下のようなコマンドを使用することが出来ます。\n\n・235ap\n\n・235apremove\n\n・235apall\n\n・235notap\n\n・235apsearch\n\n・235birthday\n\n・235men\n\n・235roomdivision\n\n各コマンドの機能の詳細を知りたい場合は、スラッシュコマンド **/** を使って知りたい機能を選択してください。');

        setTimeout(() => {
          message.delete()
            .then(() => console.log('message deleting.'))
            .catch(() => console.log('message is deleted.'));
        }, this.setTimeoutSec);
        break;

      default:
        message.reply('235botは以下のようなコマンドを使用することが出来ます。\n\n・235ap\n\n・235apremove\n\n・235apall\n\n・235notap\n\n・235apsearch\n\n・235roomdivision\n\n各コマンドの機能の詳細を知りたい場合は、スラッシュコマンド **/** を使って知りたい機能を選択してください。');

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
        `日々のプロデュース業お疲れ様です！${commandList[0]}月にお誕生日を迎えるメンバーさんの…ご案内です！！\n${commandList[0]}月に誕生日を迎えるのは～…\n\n"`,
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
   * 235testコマンド 新しい機能を追加する時に実験とかする用
   *
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   *
   * @return {void}
   */
  private testCommand(message: typeof Message, commandName: string): void {
    if ((commandName !== 'test') || (message.author.id !== this.discordBot.userIdForMaki)) return;

    message.reply('テスト用コマンド');

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
}
