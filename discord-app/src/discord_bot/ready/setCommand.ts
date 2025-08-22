import { DiscordBotType } from '../DiscordBotType';

/**
 * 235botのコマンドを設定
 * これをすることによって、スラッシュコマンドを使用する時に、235botのコマンドがすぐに出てくるようになる。
 *
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (client: DiscordBotType) => {
  if (client.guilds.cache.get(client.serverIdFor235) === undefined) return;

  await client.application!.commands.set(client.commandList, client.serverIdFor235);
};
