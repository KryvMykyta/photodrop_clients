import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import { ErrorGenerator } from "./ErrorGenerator";
dotenv.config();

const secret = process.env.SECRET_KEY;

export class TokenGenerator {
  public createAccessToken = (phone: string) => {
    const accessToken = jwt.sign({ phone }, secret, {
      expiresIn: `24h`,
    });
    return accessToken;
  };

  public verifyToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (err) {
      throw new ErrorGenerator(401, "Unauthorized");
    }
  };

  public createOtpToken = () => {
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    return otp;
  };
}
