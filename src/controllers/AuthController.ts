import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { UtilsClasses } from "./../app";
import { Request, Response } from "express";
import { TokenGenerator } from "./../utils/Tokens";
import { OtpRepository } from "./../repository/OtpsRepository";
import { UsersRepository } from "./../repository/UsersRepository";
import { TelegramSenderBot } from "./../utils/TelegramBot";

export class AuthController {
  tokenGenerator: TokenGenerator;
  otpRepository: OtpRepository;
  usersRepository: UsersRepository;
  telegramSender: TelegramSenderBot;
  constructor(utilsClasses: UtilsClasses) {
    this.usersRepository = utilsClasses.usersRepository;
    this.tokenGenerator = utilsClasses.tokenGenerator;
    this.otpRepository = utilsClasses.otpRepository;
    this.telegramSender = utilsClasses.telegBot;
  }

  public login = async (
    req: Request<{}, {}, { phoneNumber: string }, {}>,
    res: Response
  ) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) throw new ErrorGenerator(502, "Bad Request");
      const token = this.tokenGenerator.createOtpToken();
      this.otpRepository.updateOtp(phoneNumber, token);
      const chat = await this.telegramSender.botInstance.getChat(
        "-1001879689159"
      );
      await this.telegramSender.sendOtp(
        chat.id,
        `Token for login for number ${phoneNumber} is ${token}`
      );
      return res.status(200).send(token);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };

  public verifyLogin = async (
    req: Request<{}, {}, { phoneNumber: string; otp: string }, {}>,
    res: Response
  ) => {
    try {
      const { phoneNumber, otp } = req.body;
      console.log(phoneNumber, otp);
      if (!phoneNumber || !otp) throw new ErrorGenerator(502, "Bad Request");
      const tokenRecord = this.otpRepository.getToken(phoneNumber);
      const otpRecord = tokenRecord[0]?.otp;
      if (!otpRecord || otpRecord !== otp)
        throw new ErrorGenerator(401, "Invalid credentials");
      const accessToken = this.tokenGenerator.createAccessToken(phoneNumber);
      await this.usersRepository.addUser(phoneNumber);
      return res.status(200).send({ accessToken });
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}
