import { TextChannel, Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import DeleteMessageRepository from '../../../repositories/DeleteMessageRepository';

/**
 * 9時15分に雑談場（通話外）チャンネルでメッセージ送信して1週間経ったメッセージを削除
 *
 * @param {DiscordBotType} client Clientクラス
 */
export default (client: DiscordBotType) => {
  const setTime = new Date();
  setTime.setDate(setTime.getDate() - 7);
  const dateSevenDaysAgo = setTime.getDate();

  DeleteMessageRepository.findDeleteMessages(dateSevenDaysAgo)
    .then((foundData: { message_id: string; date: number }[]) => {
      if (foundData.length === 0) return;

      const targetMessage = client.channels.cache.get(
        client.channelIdFor235ChatPlace,
      ) as TextChannel;
      let deleteIndex = 0;

      const deleteTimer = setInterval(() => {
        switch (deleteIndex) {
          case foundData.length:
            clearInterval(deleteTimer);

            break;

          default:
            targetMessage.messages
              .fetch(foundData[deleteIndex].message_id)
              .then(async (foundMessage: Message) => {
                await foundMessage.delete();

                await DeleteMessageRepository.deleteMessage(foundData[deleteIndex].message_id);

                deleteIndex += 1;
              })
              .catch(() => {});

            break;
        }
      }, 5_000);
    })
    .catch(() => {});
};
