const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);

const channel1 = process.env.CH1;
const channel2 = process.env.CH2;
const adminChatId = Number(process.env.CHAT_ID);
const userState = {};

// Стартовое меню с кнопкой "Запустить бота"
bot.start((ctx) => {
  ctx.reply(
    "Привет! Добро пожаловать. Пожалуйста, выберите действие:",
    Markup.inlineKeyboard([
      [Markup.button.callback("Отправить сообщение в канал📨", "send_message")],
      [Markup.button.callback("Голосовать за канал 🧡", "vote_channel")],
    ])
  );
});

// Обработка нажатия кнопки "Отправить сообщение"
bot.action("send_message", async (ctx) => {
  // Проверяем подписку на каналы
  const subscribedToChannel1 = await isUserSubscribed(ctx, channel1);
  const subscribedToChannel2 = await isUserSubscribed(ctx, channel2);

  if (subscribedToChannel1 && subscribedToChannel2) {
    // Предлагаем выбрать канал для отправки сообщения
    ctx.reply(
      "В какой канал вы хотите отправить сообщение?",
      Markup.inlineKeyboard([
        [Markup.button.callback("Я люблю🧡", "choose_channel1")],
        [Markup.button.callback("Я хочу🖤", "choose_channel2")],
        [Markup.button.callback("Вернуться в главное меню", "main_menu")],
      ])
    );
  } else {
    // Предлагаем подписаться на каналы
    ctx.reply(
      "Пожалуйста, подпишитесь на оба канала, чтобы отправить сообщение:",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Я люблю🧡", url: "https://t.me/tststsyyu" }],
            [{ text: "Я хочу🖤", url: "https://t.me/trtrtrtryur" }],
            [{ text: "Я подписался", callback_data: "check_subscription" }],
            [{ text: "Вернуться в главное меню", callback_data: "main_menu" }],
          ],
        },
      }
    );
  }
});

// Обработка нажатия кнопки "Голосовать за канал"
bot.action("vote_channel", (ctx) => {
  ctx.reply(
    "Выберите канал для голосования:",
    Markup.inlineKeyboard([
      [
        {
          text: "Буст для Я люблю🧡",
          url: "https://t.me/boost/i_loveeeitttt",
        },
      ],
      [
        {
          text: "Буст для Я хочу🖤",
          url: "https://t.me/boost/iwantyoulav",
        },
      ],
      [Markup.button.callback("Вернуться в главное меню", "main_menu")],
    ])
  );
});

// Обработка нажатия кнопки "Я подписался"
bot.action("check_subscription", async (ctx) => {
  const subscribedToChannel1 = await isUserSubscribed(ctx, channel1);
  const subscribedToChannel2 = await isUserSubscribed(ctx, channel2);

  if (subscribedToChannel1 && subscribedToChannel2) {
    ctx.reply(
      "Спасибо за подписку! Теперь вы можете отправить свое сообщение.",
      Markup.inlineKeyboard([
        [Markup.button.callback("Отправить сообщение", "send_message")],
        [Markup.button.callback("Вернуться в главное меню", "main_menu")],
      ])
    );
  } else {
    ctx.reply("Пожалуйста, убедитесь, что вы подписаны на оба канала.");
  }
});

// Обработка нажатия кнопки "Вернуться в главное меню"
bot.action("main_menu", (ctx) => {
  ctx.reply(
    "Выберите действие:",
    Markup.inlineKeyboard([
      [Markup.button.callback("Отправить сообщение", "send_message")],
      [Markup.button.callback("Голосовать за канал", "vote_channel")],
    ])
  );
});

// Обработка выбора канала для отправки сообщения
bot.action(["choose_channel1", "choose_channel2"], (ctx) => {
  const selectedChannel =
    ctx.callbackQuery.data === "choose_channel1" ? "Я люблю🧡" : "Я хочу🖤";

  // Сохраняем выбранный канал в состоянии пользователя
  userState[ctx.from.id] = { selectedChannel };

  ctx.reply(
    "Пожалуйста, отправьте ваше сообщение:",
    Markup.inlineKeyboard([[Markup.button.callback("Отмена", "cancel")]])
  );
});

// Обработка нажатия кнопки "Отмена"
bot.action("cancel", (ctx) => {
  // Очищаем состояние пользователя
  delete userState[ctx.from.id];
  ctx.reply(
    "Действие отменено.",
    Markup.inlineKeyboard([
      [Markup.button.callback("Вернуться в главное меню", "main_menu")],
    ])
  );
});

// Обработка входящих сообщений разных типов
bot.on(
  [
    "text",
    "photo",
    "video",
    "document",
    "audio",
    "voice",
    "sticker",
    "animation",
  ],
  async (ctx) => {
    const state = userState[ctx.from.id];

    // Если пользователь находится в процессе отправки сообщения
    if (state && state.selectedChannel) {
      const selectedChannel = state.selectedChannel;

      try {
        // Пересылаем сообщение администратору с информацией о выбранном канале
        await forwardMessageToAdmin(ctx, selectedChannel);

        // Уведомляем пользователя
        await ctx.reply(
          "Ваше сообщение отправлено администратору на рассмотрение.",
          Markup.inlineKeyboard([
            [Markup.button.callback("Вернуться в главное меню", "main_menu")],
          ])
        );

        // Очищаем состояние пользователя
        delete userState[ctx.from.id];
      } catch (error) {
        console.error("Ошибка при отправке сообщения администратору:", error);
        await ctx.reply(
          "Произошла ошибка при отправке вашего сообщения. Пожалуйста, попробуйте позже."
        );
      }
    }
  }
);

async function forwardMessageToAdmin(ctx, selectedChannel) {
  const message = ctx.message;

  // Информация о пользователе и выбранном канале
  const userInfo =
    `Пользователь: ${ctx.from.first_name} ${ctx.from.last_name || ""} (@${
      ctx.from.username || "не указан"
    })\n` + `Хочет опубликовать сообщение в: ${selectedChannel}`;

  // Отправляем информацию администратору
  await ctx.telegram.sendMessage(adminChatId, userInfo);

  // Пересылаем сообщение администратору
  await ctx.telegram.copyMessage(adminChatId, ctx.chat.id, message.message_id);
}

// Функция проверки подписки на каналы
async function isUserSubscribed(ctx, channel) {
  try {
    const member = await ctx.telegram.getChatMember(channel, ctx.from.id);
    return ["creator", "administrator", "member"].includes(member.status);
  } catch (error) {
    console.error(`Ошибка при проверке подписки на канал ${channel}:`, error);
    // Возвращаем false без уведомления пользователя
    return false;
  }
}

bot.launch();
console.log("Бот запущен");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
