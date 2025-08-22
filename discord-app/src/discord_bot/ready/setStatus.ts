import { DiscordBotType } from '../DiscordBotType';

/**
 * 235botのステータスを設定
 * これを設定することによって、「〇〇をプレイ中」のように表示させることが出来る。
 *
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default (client: DiscordBotType) => {
  client.user!.setPresence({
    activities: [{ name: 'アイドルマスター ミリオンライブ! シアターデイズ ' }],
    status: 'online',
  });
};
