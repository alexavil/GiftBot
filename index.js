require("dotenv/config");

const TelegramBot = require("node-telegram-bot-api");

const sql = require("better-sqlite3");
let data = new sql("./data/users.db");

data.prepare("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, tgid STRING UNIQUE, name STRING, tickets INTEGER)").run();

const bot = new TelegramBot(process.env.TOKEN, {
    polling: true,
    onlyFirstMatch: true,
});


bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    data.prepare(`INSERT OR IGNORE INTO users(tgid, name, tickets) VALUES (${userId}, '${username}', 0)`).run();
    bot.sendMessage(
        chatId,
        `Примите участие в розыгрыше призов и станьте победителем!
Для того, чтобы участвовать, необходимо купить билет.`, {
    "reply_markup": {
        "keyboard": [["Купить билет", "Проверить количество билетов"]]
    }
}
    );
});

bot.onText(/\/help/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    data.prepare(`INSERT OR IGNORE INTO users(tgid, name, tickets) VALUES (${userId}, '${username}', 0)`).run();
    bot.sendMessage(
        chatId,
        `/ticket - купить билеты
/stats - проверить количество билетов`
    );
});

bot.onText(/\/ticket/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    data.prepare(`INSERT OR IGNORE INTO users(tgid, name, tickets) VALUES (${userId}, '${username}', 0)`).run();
    bot.sendInvoice(chatId, "Билет для участия в розыгрыше", "Купив билет, вы получите шанс стать победителем в следующем розыгрыше!", "ticket", "", "XTR", [ { label: "Ticket", amount: 1, }, ])
});

bot.onText(/\/stats/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    data.prepare(`INSERT OR IGNORE INTO users(tgid, name, tickets) VALUES (${userId}, '${username}', 0)`).run();
    let tickets = data.prepare(`SELECT * FROM users WHERE tgid = '${userId}'`).get().tickets;
    bot.sendMessage(chatId, `Количество билетов: ${tickets}`)
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    switch (msg.text) {
        case "Купить билет": {
            return bot.sendInvoice(chatId, "Билет для участия в розыгрыше", "Купив билет, вы получите шанс стать победителем в следующем розыгрыше!", "ticket", "", "XTR", [ { label: "Ticket", amount: 1, }, ]);
        }
        case "Проверить количество билетов": {
            let tickets = data.prepare(`SELECT * FROM users WHERE tgid = '${userId}'`).get().tickets;
            return bot.sendMessage(chatId, `Количество билетов: ${tickets}`)
        }
        default:
            return false;
    }
});

bot.on("shipping_query", (shippingQuery) => {
    const userId = shippingQuery.from.id;
    let tickets = data.prepare(`SELECT * FROM users WHERE tgid = '${userId}'`).get().tickets;
    data.prepare(`UPDATE users SET tickets = '${tickets + 1}' WHERE tgid = '${userId}'`).run();
    bot.answerShippingQuery(shippingQuery.id, true, [
        {
            id: "ticket",
            title: "Билет",
            description: "Билет для участия в розыгрыше",
            currency: "XTR",
            total_amount: 1,
        },
    ]);
});

bot.on("polling_error", (err) => {
    console.log(err)
});