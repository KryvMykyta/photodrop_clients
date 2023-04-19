import TelegramBot from "node-telegram-bot-api";


export class TelegramSenderBot {
    botInstance: TelegramBot
    constructor(bot: TelegramBot){
        this.botInstance = bot
    }

    public sendOtp = async (chatId: number, otp: string) => {
        await this.botInstance.sendMessage(chatId, `Your token to authorize is: ${otp}`)
    }
}