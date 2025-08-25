import deleteReplyMessage from './deleteReplyMessage';
import storeMessage from './storeMessage';
import reactToBirthday235MemberMessage from './reactToBirthday235MemberMessage';
import reactToBirthdayMillionMemberMessage from './reactToBirthdayMillionMemberMessage';
import reactToUsedMaleEventCommandMessage from './reactToUsedMaleEventCommandMessage';

const {
  Client,
  EmbedBuilder,
  GuildMember,
  GuildScheduledEventEntityType,
  GuildScheduledEventManager,
  GuildScheduledEventPrivacyLevel,
  Message,
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const DiscordBot = require('../DiscordBot').default;
const Gemini = require('../../gemini/Gemini').default;
const VoiceVox = require('../../voice_vox/VoiceVox').default;
const BirthdayFor235MemberRepository =
  require('../../../repositories/BirthdayFor235MemberRepository').default;

const { BirthdayFor235Member, BirthdayForMillionMember, DeleteMessage, DictWord } =
  require('../../../models/index').default;

/**
 * メッセージが送信された時に行う処理クラス
 */
export default class MessageCreate {
  private discordBot: typeof DiscordBot;

  private gemini: typeof Gemini;

  private voiceVox: typeof VoiceVox;

  private readonly userIdFor235Bot = process.env.USER_ID_FOR_235_BOT;

  private readonly prefix = '235';

  private readonly setTimeoutSec = 15_000;

  private readonly maleEventEmojiList = [
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣',
    '7️⃣',
    '8️⃣',
    '9️⃣',
    '🔟',
  ];

  /**
   * @param {DiscordBot} discordBot DiscordBotクラス
   * @param {VoiceVox} voiceVox VoiceVoxクラス
   */
  constructor(discordBot: typeof DiscordBot, voiceVox: typeof VoiceVox) {
    this.discordBot = discordBot;
    this.voiceVox = voiceVox;

    this.gemini = new Gemini();
  }

  /**
   * messageCreate メイン処理
   *
   * @return {void}
   */
  public messageCreateEvent(): void {
    this.discordBot.on('messageCreate', async (message: typeof Message) => {
      reactToUsedMaleEventCommandMessage(message, this.discordBot);
      reactToBirthday235MemberMessage(message, this.discordBot);
      await reactToBirthdayMillionMemberMessage(message, this.discordBot);
      deleteReplyMessage(message);
      await storeMessage(message, this.discordBot);

      // botからのメッセージは無視
      if (message.author.bot) return;

      await this.generateResponseForGemini(message, this.discordBot);

      await this.readTextForVoiceVox(this.discordBot, message);

      // 自己紹介チャンネルから新しく入ったメンバーの誕生日を登録する＆挨拶をする
      if (
        this.discordBot.channels.cache.get(this.discordBot.channelIdFor235Introduction) !==
          undefined &&
        message.channelId === this.discordBot.channelIdFor235Introduction
      ) {
        // 誕生日を登録
        MessageCreate.registNew235MemberBirthday(message, this.discordBot);

        // 挨拶
        message.react('<:_Stmp_Tsubasa:794969154817753088>');
        message.reply(
          `${message.author.globalName}さん、235プロダクションへようこそ！\nこれからもよろしくおねがいします♪`,
        );
        this.discordBot.users.cache
          .get(this.discordBot.userIdForMaki)
          .send(`${message.author.globalName}さんが新しく235プロダクションに参加されました！`);
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
      await this.birthdayEventCommand(message, commandName, commandList);
      this.menEventCommand(message, commandName, commandList);
      this.roomDivisionCommand(this.discordBot, message, commandName);
      await this.joinVoiceChannelCommand(this.discordBot, message, commandName);
      await this.disconnectVoiceChannelCommand(message, commandName);
      this.testCommand(message, commandName, commandList);
    });
  }

  /**
   * geminiを使って235bot宛に来た質問に対して回答文を生成
   *
   * @param {Message} message Messageクラス
   * @param {Client} client Clientクラス
   *
   * @return {Promise<void>}
   */
  private async generateResponseForGemini(
    message: typeof Message,
    client: typeof Client,
  ): Promise<void> {
    if (!message.mentions.has(this.userIdFor235Bot)) return;

    let formattedMessage = message.content.replace(/<@!?(\d+)>/g, '').trim();
    formattedMessage = formattedMessage.replace(VoiceVox.emojiRegex(), '');

    const introductionDataList = await client.channels.cache
      .get(client.channelIdFor235Introduction)
      .messages.fetch();
    const introductionData = introductionDataList.map((m: any) => m.content).join('\n');

    message.channel.sendTyping();

    const response: string = await this.gemini.generateResponseForGemini(
      formattedMessage,
      introductionData,
    );

    const responseList = response.split('\n\n');

    const formattedMessageList: string[] = [];
    let formattedMessageText = '';

    responseList.forEach((text: string) => {
      const textWithBreak = `${text}\n\n`;

      if (formattedMessageText.length + textWithBreak.length > 2000) {
        formattedMessageList.push(formattedMessageText);
        formattedMessageText = textWithBreak;
      } else {
        formattedMessageText += textWithBreak;
      }
    });

    if (formattedMessageText.length > 0) {
      formattedMessageList.push(formattedMessageText);
    }

    let geminiReplyIndex = 0;

    const geminiReplyTimer = setInterval(() => {
      if (geminiReplyIndex === formattedMessageList.length) {
        clearInterval(geminiReplyTimer);

        setTimeout(() => {
          message
            .delete()
            .then(() => console.log('message deleting.'))
            .catch(() => console.log('message is deleted.'));
        }, this.setTimeoutSec);

        return;
      }

      message.reply(formattedMessageList[geminiReplyIndex]);
      geminiReplyIndex += 1;
    }, 4_000);
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
    if (client.connection === undefined) return;

    const formatMessageList: string[] = message.content.split(' ');
    const commandList = client.commandList.map((command: any) => command.name);

    if (commandList.includes(formatMessageList[0])) return;

    const readChannelIdList = [client.connection.joinConfig.channelId];

    const readTextChannelList = [
      {
        voiceChannelId: this.discordBot.voiceChannelIdFor235ChatPlace,
        channelId: this.discordBot.channelIdFor235ListenOnly,
      },
      {
        voiceChannelId: this.discordBot.voiceChannelIdFor235ChatPlace2,
        channelId: this.discordBot.channelIdFor235ListenOnly2,
      },
      {
        voiceChannelId: this.discordBot.voiceChannelIdForGame,
        channelId: this.discordBot.channelIdForGameListenOnly,
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

    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

    const speakerIdExists = await BirthdayFor235MemberRepository.getSpeakerIdFromMessageSender(
      message.author.id,
    );

    const speakerId = speakerIdExists ?? client.speakerId;

    let readText: string = VoiceVox.formatMessage(message.content);
    readText = await VoiceVox.replaceWord(readText);

    await VoiceVox.generateAudioFile(readText, wavFile, speakerId);

    this.voiceVox.addWavFileToQueue(wavFile);
  }

  /**
   * 235プロダクションに新しく入ってきた方の誕生日を登録
   *
   * @param {Message} message Messageクラス
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private static registNew235MemberBirthday(message: typeof Message, client: typeof Client): void {
    const messageList: string[] = message.content.replace(/\r?\n/g, '').split(/：|・/);
    const foundIndex: number = messageList.indexOf('生年月日');

    if (foundIndex === -1) return;

    const birthdayList: string[] = messageList[foundIndex + 1]
      .split(/年|月|\//)
      .map((data) => data.match(/\d+/g)![0].replace(/^0+/, ''));

    if (birthdayList.length === 3) {
      birthdayList.shift();
    }

    BirthdayFor235MemberRepository.registNew235MemberBirthday(
      message.author.globalName,
      message.author.id,
      birthdayList[0],
      birthdayList[1],
    ).then(() => {
      client.users.cache
        .get(client.userIdForMaki)
        .send(
          `${message.author.globalName}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日`,
        );
      client.users.cache
        .get(client.userIdForUtatane)
        .send(
          `${message.author.globalName}さんの誕生日を新しく登録しました！\n${birthdayList[0]}月${birthdayList[1]}日\nもし間違いがあった場合は報告をお願いします！`,
        );
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
        message.reply(
          '235botは以下のようなコマンドを使用することが出来ます。\n\n・235birthday\n毎月開催されるオンライン飲み会の企画文章を作成することが出来ます。コマンドを使用するときは、開催したい月、日程、時間の**3つ**を**半角数字のみ**、**半角スペースで区切って**入力してください。\n\n235birthday 12 14 21\n\n・235men\n毎月開催される235士官学校🌹の日程を決める文章を作成することが出来ます。コマンドを使用するときは、開催したい日程を**2～10個**、**半角数字のみ**で入力してください。\n\n235men 12 14 16 17\n\n・235roomdivision\n【雑談１】ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、【雑談１】ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、【雑談１】ボイスチャンネルに参加しているメンバーのみが使用できます。\n\n235botはスラッシュコマンド（**/**）にも対応しています。スラッシュコマンドを使用することで、テキストの読み上げ機能などを利用することが出来ます。',
        );

        setTimeout(() => {
          message
            .delete()
            .then(() => console.log('message deleting.'))
            .catch(() => console.log('message is deleted.'));
        }, this.setTimeoutSec);
        break;

      default:
        message.reply(
          '235botは以下のようなコマンドを使用することが出来ます。\n\n・235roomdivision\n【雑談１】ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、【雑談１】ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、【雑談１】ボイスチャンネルに参加しているメンバーのみが使用できます。\n\n235botはスラッシュコマンド（**/**）にも対応しています。スラッシュコマンドを使用することで、テキストの読み上げ機能などを利用することが出来ます。',
        );

        setTimeout(() => {
          message
            .delete()
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
  private async birthdayEventCommand(
    message: typeof Message,
    commandName: string,
    commandList: string[],
  ): Promise<void> {
    if (commandName !== 'birthday' || message.author.id !== this.discordBot.userIdForUtatane)
      return;

    if (commandList.length < 3 || commandList.length > 4) {
      message.reply(
        '235birthdayコマンドを使う場合、birthdayの後にオンライン飲み会を開催したい月、日、時間 （半角数字のみ、曜日は不要） の3つを入力してください。\n任意のテキストを追加したい場合は、3つ入力した後に、追加したいテキストを入力してください。\n※半角スペースで区切るのを忘れずに！！\n\n235birthday 8 15 21',
      );

      setTimeout(() => {
        message
          .delete()
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
      message.reply(
        '半角数字以外が含まれています！\n月、日、時間は全て**半角数字のみ**で入力してください！',
      );

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (Number(commandList[0]) < 1 || Number(commandList[0]) > 12) {
      message.reply('月は1～12の間で入力してください！');

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    const today = new Date();
    const lastDateTime = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    // 今月末日を取得
    const lastDate = lastDateTime.getDate();

    if (Number(commandList[1]) < 1 || Number(commandList[1]) > lastDate) {
      message.reply(`日は1～${lastDate}の間で入力してください！`);

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (Number(commandList[2]) < 0 || Number(commandList[2]) > 23) {
      message.reply('時間は0～23の間で入力してください！');

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

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

    let eventText: string = `@everyone\n${textList[0][Math.floor(Math.random() * textList[0].length)]}`;

    BirthdayFor235MemberRepository.getThisMonthBirthdayMember(commandList[0]).then(
      (
        birthdayMemberList: {
          name: string;
          user_id: string;
          month: number;
          date: number;
          speaker_id: number;
        }[],
      ) => {
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
      },
    );

    const description = commandList[3] ?? 'ラウンジDiscordに集まってオンラインでやる飲み会だよ！';

    const eventId = await this.createScheduleEvent(
      `${commandList[0]}月期ラウンジオンライン飲み会`,
      description,
      eventDateTime,
      this.discordBot.voiceChannelIdFor235ChatPlace,
    );

    setTimeout(
      () =>
        message.reply(
          `うたたねさん、今回もお疲れ様です！\n\n【${commandList[0]}月期ラウンジオンライン飲み会】のイベントを作成しました！\nhttps://discord.com/events/${this.discordBot.serverIdFor235}/${eventId}\n\nいつもありがとうございます♪`,
        ),
      6_000,
    );

    setTimeout(() => {
      message
        .delete()
        .then(() => console.log('message deleting.'))
        .catch(() => console.log('message is deleted.'));
    }, this.setTimeoutSec);
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
    if (commandName !== 'men' || message.author.id !== this.discordBot.userIdForUtatane) return;

    if (commandList.length < 1 || commandList.length > 10) {
      message.reply(
        '235menコマンドは、235士官学校の日程を決めるために使用するコマンドです。\n開校したい日程を**半角スペースで区切って**入力してください。（半角数字のみ、月、曜日などは不要）\n入力できる日程の数は**2～10個まで**です！\n\n235men 8 12 15 21',
      );

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    const isAllInt: boolean = commandList.every((date) => Number.isInteger(Number(date)));

    if (!isAllInt) {
      message.reply('半角数字以外が含まれています！\n日程は**半角数字のみ**で入力してください！');

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (MessageCreate.isExistsSameValue(commandList)) {
      message.reply('同じ日程が入力されています！');

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    const today = new Date();
    const lastDateTime = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    // 今月末日を取得
    const lastDate = lastDateTime.getDate();

    const isValidDate: boolean = commandList.every(
      (date) => Number(date) >= 1 && Number(date) <= lastDate,
    );

    if (!isValidDate) {
      message.reply(`日は1～${lastDate}の間で入力してください！`);

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    commandList.sort((a, b) => Number(a) - Number(b));

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const eventDayList = commandList.map((date) =>
      new Date(todayYear, todayMonth - 1, Number(date)).getDay(),
    );

    const week = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

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

    setTimeout(
      () => message.reply('うたたねさん、今回もお疲れ様です！\nいつもありがとうございます♪'),
      6_000,
    );

    setTimeout(() => {
      message
        .delete()
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
      userName: string;
      userId: string;
    }[] = client.voice.client.channels.cache
      .get(this.discordBot.voiceChannelIdFor235ChatPlace)
      .members.filter((member: typeof GuildMember) => member.user.bot === false)
      .map((member: typeof GuildMember) => {
        return {
          userName: member.user.globalName,
          userId: member.user.id,
        };
      });

    const isParticipateVoiceChannelUsedCommandMember: boolean =
      participatingVoiceChannelMemberList.some(
        (participatingVoiceChannelMember: { userName: string; userId: string }) =>
          participatingVoiceChannelMember.userId === message.author.id,
      );

    if (!isParticipateVoiceChannelUsedCommandMember) {
      message.reply(
        '235roomdivision コマンドは、【雑談１】ボイスチャンネルに参加しているメンバーが使用できるコマンドです。',
      );

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (participatingVoiceChannelMemberList.length < 10) {
      message.reply(
        '【雑談１】ボイスチャンネルに参加しているメンバーの人数が10人未満のため、分けることが出来ません！',
      );

      setTimeout(() => {
        message
          .delete()
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
    let halfMemberList: { userName: string; userId: string }[] = [];
    let halfMemberList2: { userName: string; userId: string }[] = [];

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
      duplicationCount = halfMemberList2.filter(
        (participatingVoiceChannelMember: { userName: string; userId: string }) => {
          return (
            this.discordBot.dividedUserIdList.indexOf(participatingVoiceChannelMember.userId) !== -1
          );
        },
      ).length;
    }

    // 2個目の配列のメンバーを雑談２ボイスチャンネルに移動
    const dividedUserNameList = halfMemberList.map(
      (dividedMember: { userName: string; userId: string }) => dividedMember.userName,
    );

    const dividedUserNameList2 = halfMemberList2.map(
      (dividedMember: { userName: string; userId: string }) => dividedMember.userName,
    );

    const dividedUserIdList2 = halfMemberList2.map(
      (dividedMember: { userName: string; userId: string }) => dividedMember.userId,
    );

    this.discordBot.dividedUserIdList = dividedUserIdList2;

    setTimeout(
      () =>
        message.reply(
          `このような結果になりました！\n\n**【雑談１】**\n------------------------------------------------------------\n${dividedUserNameList.join('\n')}\n------------------------------------------------------------\n\n**【雑談２】**\n------------------------------------------------------------\n${dividedUserNameList2.join('\n')}\n------------------------------------------------------------\n\n自動で分けられますのでしばらくお待ちください。`,
        ),
      2_000,
    );

    setTimeout(() => {
      let divisionCount: number = 0;

      const roomDivideTimer = setInterval(() => {
        switch (divisionCount) {
          case halfMemberList2.length:
            message
              .delete()
              .then(() => console.log('message deleting.'))
              .catch(() => console.log('message is deleted.'));
            clearInterval(roomDivideTimer);
            break;

          default:
            client.guilds.cache
              .get(this.discordBot.serverIdFor235)
              .members.fetch(dividedUserIdList2[divisionCount])
              .then((member: typeof GuildMember) =>
                member.voice.setChannel(this.discordBot.voiceChannelIdFor235ChatPlace2),
              );

            divisionCount += 1;
            break;
        }
      }, 1_000);
    }, 9_000);
  }

  /**
   * 235joinコマンド コマンドを入力したメンバーが入っているボイスチャンネルに参加
   *
   * @param {Client} client Clientクラス
   * @param {Message} message Messageクラス
   * @param {string} commandName 入力されたコマンド名
   *
   * @return {void}
   */
  private async joinVoiceChannelCommand(
    client: typeof Client,
    message: typeof Message,
    commandName: string,
  ) {
    if (commandName !== 'join') return;

    const usedCommandMember = await message.guild.members.fetch(message.author.id);
    const memberJoinVoiceChannel = usedCommandMember.voice.channel;

    if (
      client.connection !== undefined &&
      client.connection.joinConfig.channelId === memberJoinVoiceChannel.id
    ) {
      const embed = new EmbedBuilder()
        .setTitle('既に接続されています！')
        .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
        .setColor('#FF0000')
        .setTimestamp();

      message.reply({ embeds: [embed] });

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (memberJoinVoiceChannel === null) {
      message.reply(
        '235joinコマンドを使用することで、使用したメンバーが参加しているボイスチャンネルに235botが参加して、そのボイスチャンネルの聞き専チャンネルに投稿されたテキストを読み上げます！\nボイスチャンネルに参加してから再度このスラッシュコマンドを使用していただくか、もしくはテキストで「235join」と入力していただければボイスチャンネルに参加します！',
      );

      setTimeout(() => {
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (!memberJoinVoiceChannel.joinable || !memberJoinVoiceChannel.speakable) {
      message.reply(
        '参加先のボイスチャンネルに接続できなかったか、もしくは参加先のボイスチャンネルで音声を再生する権限がありませんでした；；',
      );

      setTimeout(() => {
        message
          .delete()
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

    this.discordBot.connection.subscribe(this.discordBot.audioPlayer);

    const connectVoice =
      client.connectVoiceList[Math.floor(Math.random() * client.connectVoiceList.length)];

    const filePath = './data/voice';
    const wavFile = `${filePath}/${usedCommandMember.user.id}.wav`;

    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

    await VoiceVox.generateAudioFile(connectVoice, wavFile, client.speakerId);

    this.voiceVox.addWavFileToQueue(wavFile);

    const embed = new EmbedBuilder()
      .setTitle('接続されました！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
      .setColor('#00FF99')
      .setTimestamp();

    message.reply({ embeds: [embed] });

    setTimeout(() => {
      message
        .delete()
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
        message
          .delete()
          .then(() => console.log('message deleting.'))
          .catch(() => console.log('message is deleted.'));
      }, this.setTimeoutSec);

      return;
    }

    if (
      memberJoinVoiceChannel === null ||
      this.discordBot.connection.joinConfig.channelId !== memberJoinVoiceChannel.id
    ) {
      const embed = new EmbedBuilder()
        .setTitle(
          '切断できるのは235botが入っているボイスチャンネルに参加しているメンバーだけです！',
        )
        .setColor('#FFCC00')
        .setTimestamp();

      message.reply({ embeds: [embed] });

      setTimeout(() => {
        message
          .delete()
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
      message
        .delete()
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
    if (
      commandName !== 'test' ||
      message.author.id !== this.discordBot.userIdForMaki ||
      commandList.length === 0
    )
      return;

    switch (commandList[0]) {
      case 'birthday_for_235_members':
        BirthdayFor235Member.findAll({ raw: true }).then(
          (
            member: {
              name: string;
              user_id: string;
              month: number;
              date: number;
            }[],
          ) => console.log(member),
        );

        break;
      case 'birthday_for_million_members':
        BirthdayForMillionMember.findAll({ raw: true }).then(
          (
            member: {
              name: string;
              month: number;
              date: number;
              img: string;
            }[],
          ) => console.log(member),
        );

        break;
      case 'delete_messages':
        DeleteMessage.findAll({ raw: true }).then(
          (
            data: {
              message_id: string;
              date: number;
            }[],
          ) => console.log(data),
        );

        break;
      case 'dict_words':
        DictWord.findAll({ raw: true }).then(
          (
            data: {
              word: string;
              how_to_read: string;
            }[],
          ) => console.log(data),
        );

        break;
    }

    setTimeout(() => {
      message
        .delete()
        .then(() => console.log('message deleting.'))
        .catch(() => console.log('message is deleted.'));
    }, this.setTimeoutSec);
  }

  /**
   * オンライン飲み会、男子会のイベントを作成
   *
   * @param {string} eventTitle 作成するイベント名
   * @param {string} description 作成するイベントの説明
   * @param {Date} scheduledStartTime イベントの開始日
   * @param {string} channelId 開始場所（ボイスチャンネルのID）
   * @param {string | null} image アイコン画像
   *
   * @return {string}
   */
  private async createScheduleEvent(
    eventTitle: string,
    description: string,
    scheduledStartTime: Date,
    channelId: string,
    image: string | null = null,
  ): Promise<string> {
    const guild = this.discordBot.guilds.cache.get(this.discordBot.serverIdFor235);
    const eventManager = new GuildScheduledEventManager(guild);

    const options = {
      name: eventTitle,
      scheduledStartTime,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: GuildScheduledEventEntityType.Voice,
      description,
      channel: channelId,
      image,
    };

    const createdEvent = await eventManager.create(options);

    return createdEvent.id;
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
}
