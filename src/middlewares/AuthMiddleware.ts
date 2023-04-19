import { NextFunction, Request, RequestHandler, Response } from "express";
import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { TokenGenerator } from "./../utils/Tokens";
import { UtilsClasses } from "app";
import { OtpRepository } from "./../repository/OtpsRepository";
import { UsersRepository } from "./../repository/UsersRepository";

export class AuthMiddlewareClass {
  tokenGenerator: TokenGenerator;
  usersRepository: UsersRepository;
  constructor(tokenGenerator: TokenGenerator, usersRepository: UsersRepository) {
    this.tokenGenerator = tokenGenerator;
    this.usersRepository = usersRepository;
  }

  public isAuthorized: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        throw new ErrorGenerator(401, "Unauthorized");
      }
      const decoded = this.tokenGenerator.verifyToken(token) as {
        phone: string;
      };
      const userFound = await this.usersRepository.getUserByPhone(
        decoded.phone
      );
      if (!userFound[0]) {
        throw new ErrorGenerator(401, "Unauthorized");
      }
      req.body.phone = decoded.phone;
      next();
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}
