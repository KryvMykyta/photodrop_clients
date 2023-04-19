import S3 from "aws-sdk/clients/s3";
import dotenv from "dotenv";
dotenv.config();

export class S3Repository {
  S3Instance: S3;
  bucketName: string;

  constructor(s3: S3) {
    this.S3Instance = s3;
    this.bucketName = process.env.PHOTOS_BUCKET_NAME as string;
  }

  public getPhotoUrl = (photoKey: string) => {
    const params = {
      Bucket: this.bucketName,
      Key: photoKey,
      Expires: 60,
    }
    return this.S3Instance.getSignedUrl('getObject',params)
  }

}