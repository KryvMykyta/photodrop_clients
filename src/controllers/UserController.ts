import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { UtilsClasses } from "./../app";
import { Request, Response, Router } from "express";
import { TokenGenerator } from "./../utils/Tokens";
import { OtpRepository } from "./../repository/OtpsRepository";
import { UsersRepository } from "repository/UsersRepository";
import { AuthMiddlewareClass } from "middlewares/AuthMiddleware";
import { PhotoRepository } from "repository/PhotosRepository";
import { DataFormatter } from "./../utils/DataFormatter";
import { S3Repository } from "./../s3/S3";
import { TelegramSenderBot } from "./../utils/TelegramBot";

export class UserController {
  router: Router;
  path: string;
  tokenGenerator: TokenGenerator;
  otpRepository: OtpRepository;
  usersRepository: UsersRepository;
  authMiddleware: AuthMiddlewareClass;
  photoRepository: PhotoRepository;
  s3: S3Repository;
  telegramSender: TelegramSenderBot;
  constructor(path: string, utilsClasses: UtilsClasses) {
    (this.router = Router()), (this.path = path);
    this.s3 = utilsClasses.s3;
    this.usersRepository = utilsClasses.usersRepository;
    this.tokenGenerator = utilsClasses.tokenClass;
    this.otpRepository = utilsClasses.otpRepository;
    this.authMiddleware = utilsClasses.authMiddleware;
    this.photoRepository = utilsClasses.photoRepository;
    this.telegramSender = utilsClasses.telegBot
    this.router.get(
      "/addSelfie",
      this.authMiddleware.isAuthorized,
      this.addSelfie
    );
    this.router.get("/getMe", this.authMiddleware.isAuthorized, this.getMe);
    this.router.post(
      "/changeName",
      this.authMiddleware.isAuthorized,
      this.changeName
    );
    this.router.post(
      "/changeEmail",
      this.authMiddleware.isAuthorized,
      this.changeEmail
    );
    this.router.post(
      "/changePhone/request",
      this.authMiddleware.isAuthorized,
      this.changePhoneRequest
    );
    this.router.post(
      "/changePhone/verify",
      this.authMiddleware.isAuthorized,
      this.changePhoneVerify
    );
  }

  public changeName = async (
    req: Request<{}, {}, { phone: string }, { name: string }>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const { name } = req.query;
      if (!phone) throw new ErrorGenerator(502, "Bad request");
      await this.usersRepository.changeName(phone, name)
      return res.status(200).send("success")
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public changeEmail = async (
    req: Request<{}, {}, { phone: string }, { email: string }>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const { email } = req.query;
      if (!phone) throw new ErrorGenerator(502, "Bad request");
      await this.usersRepository.changeEmail(phone, email)
      return res.status(200).send("success")
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public changePhoneRequest = async (
    req: Request<{}, {}, { phone: string }, { newPhone: string }>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const { newPhone } = req.query;
      if (!phone) {
        throw new ErrorGenerator(502, "Bad request");
      }
      const token = this.tokenGenerator.createOtpToken();
      this.otpRepository.updateOtp(newPhone, token);
      const chat = await this.telegramSender.botInstance.getChat("-1001879689159")
      await this.telegramSender.sendOtp(chat.id, `Token for change number from ${phone} to ${newPhone} is ${token}`)
      return res.status(200).send(token)
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public changePhoneVerify = async (
    req: Request<{}, {}, { phone: string }, { newPhone: string, otp: string }>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const { otp, newPhone } = req.query;
      if (!phone || !otp || !newPhone) throw new ErrorGenerator(502, "Bad Request");
      const tokenRecord = this.otpRepository.getToken(newPhone);
      const otpRecord = tokenRecord[0]?.otp
      if (!otpRecord || otpRecord !== otp) throw new ErrorGenerator(401, "Invalid credentials");
      await this.usersRepository.changePhone(phone, newPhone)
      const accessToken = this.tokenGenerator.createAccessToken(newPhone)
      return res.status(200).send({accessToken})
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public getMe = async (
    req: Request<{}, {}, { phone: string }, {}>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        throw new ErrorGenerator(502, "Bad request");
      }
      const response = {
        phone,
        selfieUrl: await this.s3.getSelfieUrl(`selfies1/${phone}.jpeg`),
      };
      return res.status(200).send(response);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };

  public addSelfie = (
    req: Request<{}, {}, { phone: string }, {}>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        throw new ErrorGenerator(502, "Bad request");
      }
      return res.status(200).send(this.s3.getPresignedPost(phone));
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server error");
    }
  };
}
