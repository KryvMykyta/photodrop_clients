import TelegramBot from "node-telegram-bot-api";


export class TelegramSenderBot {
    botInstance: TelegramBot
    constructor(bot: TelegramBot){
        this.botInstance = bot
    }

    public sendOtp = async (chatId: number | string, msg: string) => {
        await this.botInstance.sendMessage(chatId, msg)
    }
}