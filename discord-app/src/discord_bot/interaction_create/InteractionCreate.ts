const { Interaction } = require('discord.js');
const { DiscordBot } = require('../DiscordBot');


/**
 * スラッシュコマンドが使われた時に行う処理クラス
 */
export class InteractionCreate {
  private discordBot: typeof DiscordBot;
  private readonly setTimeoutSec = 180_000;

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * interactionCreate メイン処理
   *
   * @return {void}
   */
  public interactionCreateEvent(): void {
    this.discordBot.on('interactionCreate', (interaction: typeof Interaction) => {
      if (!interaction.isCommand()) return;

      this.registAllPerfectMusicInteraction(interaction);
      this.deleteAllPerfectMusicInteraction(interaction);
      this.showAllPerfectMusicListInteraction(interaction);
      this.showNotAllPerfectMusicListInteraction(interaction);
      this.isMusicAllPerfectInteraction(interaction);
      this.createBirthdayEventMessageTemplateInteraction(interaction);
      this.createMaleEventMessageTemplateInteraction(interaction);
      this.divideVoiceChannelInteraction(interaction);
    });
  }

  /**
   * 235apコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private registAllPerfectMusicInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235ap') return;

    interaction.reply(`235apコマンドを使用することで、${interaction.user.username}さんがAPすることが出来た曲を登録することが出来ます。\nなお、もしまだ${interaction.user.username}さんが235apコマンドを使用したことがない場合、まずはAP曲データを登録する必要があるので、235ap と入力をして、AP曲データを登録してください。\n登録してからは、235ap 真夏のダイヤ☆ など、APすることが出来た曲名を入力することによって、入力された曲を登録することが出来ます！\n※入力することが出来る曲は1曲だけです。また、曲名はフルで入力する必要があります。2曲以上入力しているか、もしくはフルで入力することが出来ていない場合、登録することが出来ないので注意してください！`);

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235apremoveコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private deleteAllPerfectMusicInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235apremove') return;

    interaction.reply('235apremoveコマンドを使用することで、間違ってAP曲データに登録してしまった曲を取り消すことが出来ます。\n※入力することが出来る曲は1曲だけです。また、曲名はフルで入力する必要があります。2曲以上入力しているか、もしくはフルで入力することが出来ていない場合、登録することが出来ないので注意してください！');

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235apallコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private showAllPerfectMusicListInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235apall') return;

    interaction.reply(`235apallコマンドを使用することで、${interaction.user.username}さんが今までAPしてきた曲と曲数を知ることが出来ます。\nなお、もしまだ${interaction.user.username}さんが235apコマンドを使用したことがない場合、まずはAP曲データを登録する必要があるので、235ap と入力をして、AP曲データを登録してください。\n登録してからは、235ap 真夏のダイヤ☆ など、APすることが出来た曲名を入力することによって、入力された曲を登録することが出来ます！\n曲数をタイプで絞りたい場合、235apall Fairy のように入力することで、入力されたタイプでAPしてきた曲と曲数を知ることが出来ます。\n（絞ることが出来るタイプの数は**1つ**だけです！）`);

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235notapコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private showNotAllPerfectMusicListInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235notap') return;

    interaction.reply(`235notapコマンドを使用することで、${interaction.user.username}さんがまだAP出来ていない曲と曲数を知ることが出来ます。\nなお、もしまだ${interaction.user.username}さんが235apコマンドを使用したことがない場合、まずはAP曲データを登録する必要があるので、235ap と入力をして、AP曲データを登録してください。\n登録してからは、235ap 真夏のダイヤ☆ など、APすることが出来た曲名を入力することによって、入力された曲を登録することが出来ます！\n曲数をタイプで絞りたい場合、235apall Fairy のように入力することで、入力されたタイプでAP出来ていない曲と曲数を知ることが出来ます。\n（絞ることが出来るタイプの数は**1つ**だけです！）`);

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235apsearchコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private isMusicAllPerfectInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235apsearch') return;

    interaction.reply(`235apsearchコマンドを使用することで、${interaction.user.username}さんが入力した曲が既にAP出来ているか知ることが出来ます。\nなお、もしまだ${interaction.user.username}さんが235apコマンドを使用したことがない場合、まずはAP曲データを登録する必要があるので、235ap と入力をして、AP曲データを登録してください。\n登録してからは、235ap 真夏のダイヤ☆ など、APすることが出来た曲名を入力することによって、入力された曲を登録することが出来ます！\n※入力することが出来る曲は1曲だけです。また、曲名はフルで入力する必要があります。2曲以上入力しているか、もしくはフルで入力することが出来ていない場合、登録することが出来ないので注意してください！`);

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235birthdayコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private createBirthdayEventMessageTemplateInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235birthday') return;

    switch (interaction.user.id) {
      case this.discordBot.userIdForUtatane:
        interaction.reply('235birthdayコマンドを使用することで、毎月開催されるオンライン飲み会の企画文章を作成することが出来ます。コマンドを使用するときは、開催したい月、日程、時間の**3つ**を**半角数字のみ**、**半角スペースで区切って**入力してください。\n\n235birthday 12 14 21');

        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;

      default:
        interaction.reply('235birthday コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。');
        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;
    }
  }

  /**
   * 235menコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private createMaleEventMessageTemplateInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235men') return;

    switch (interaction.user.id) {
      case this.discordBot.userIdForUtatane:
        interaction.reply('235menコマンドを使用することで、毎月開催される235士官学校🌹の日程を決める文章を作成することが出来ます。コマンドを使用するときは、開催したい日程を**2～10個**、**半角数字のみ**で入力してください。\n\n235men 12 14 16 17');

        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;

      default:
        interaction.reply('235men コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。');
        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;
    }
  }

  /**
   * 235roomdivisionコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private divideVoiceChannelInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235roomdivision') return;

    interaction.reply('235roomdivisionコマンドを使用することで、雑談ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、雑談ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、雑談ボイスチャンネルに参加しているメンバーのみが使用できます。');

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }
}
