import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { UtilsClasses } from "./../app";
import { Request, Response, Router } from "express";
import { TokenGenerator } from "./../utils/Tokens";
import { OtpRepository } from "./../repository/OtpsRepository";
import { UsersRepository } from "repository/UsersRepository";
import { TelegramSenderBot } from "utils/TelegramBot";

export class AuthController {
  router: Router;
  path: string;
  tokenGenerator: TokenGenerator;
  otpRepository: OtpRepository;
  usersRepository: UsersRepository;
  telegramSender: TelegramSenderBot;
  constructor(path: string, utilsClasses: UtilsClasses) {
    (this.router = Router()), (this.path = path);
    this.usersRepository = utilsClasses.usersRepository
    this.tokenGenerator = utilsClasses.tokenClass;
    this.otpRepository = utilsClasses.otpRepository;
    this.telegramSender = utilsClasses.telegBot
    this.router.post("/login", this.login);
    this.router.post("/login/verify", this.verifyLogin);
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
      await this.telegramSender.sendOtp(801311557, token)
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
      const otpRecord = tokenRecord[0]?.otp
      if (!otpRecord || otpRecord !== otp) throw new ErrorGenerator(401, "Invalid credentials");
      const accessToken = this.tokenGenerator.createAccessToken(phoneNumber)
      await this.usersRepository.addUser(phoneNumber)
      return res.status(200).send({accessToken});
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}
