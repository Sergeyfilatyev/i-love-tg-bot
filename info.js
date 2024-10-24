// const { Telegraf } = require("telegraf");
// const axios = require("axios");
// require("dotenv").config();

// const botToken = process.env.BOT_TOKEN;

// const bot = new Telegraf(botToken);
// bot.start((ctx) =>
//   ctx.reply("Отправь мне любое сообщение в канале, где я администратор.")
// );

// bot.on("message", (ctx) => {
//   console.log(ctx.message);
// });

// bot.launch();
// (async () => {
//   try {
//     const channelInfo1 = await bot.telegram.getChat("@channel_username1");
//     console.log(`ID первого канала: ${channelInfo1.id}`);

//     const channelInfo2 = await bot.telegram.getChat("@channel_username2");
//     console.log(`ID второго канала: ${channelInfo2.id}`);
//   } catch (error) {
//     console.error("Ошибка при получении ID каналов:", error);
//   } finally {
//     process.exit();
//   }
// })();
// bot.js;
// bot.action(["choose_channel1", "choose_channel2"], async (ctx) => {
//   // Проверяем подписку на каналы ещё раз
//   const subscribedToChannel1 = await isUserSubscribed(ctx, channel1);
//   const subscribedToChannel2 = await isUserSubscribed(ctx, channel2);

//   if (!subscribedToChannel1 || !subscribedToChannel2) {
//     ctx.reply(
//       "Вы больше не подписаны на оба канала. Пожалуйста, подпишитесь снова, чтобы отправить сообщение:",
//       {
//         reply_markup: {
//           inline_keyboard: [
//             [{ text: "Канал 1", url: "https://t.me/channelusername1" }],
//             [{ text: "Канал 2", url: "https://t.me/channelusername2" }],
//             [{ text: "Я подписался", callback_data: "check_subscription" }],
//             [{ text: "Вернуться в главное меню", callback_data: "main_menu" }],
//           ],
//         },
//       }
//     );
//     return;
//   }

//   // Остальной код...
// });
