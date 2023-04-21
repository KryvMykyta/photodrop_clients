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

  public getPresignedPost = (login: string) => {
    const photoKey = `selfies/${login}.jpeg`
    const params = {
      Bucket: this.bucketName,
      Key: photoKey,
      Expires: 300,
      Conditions: [["content-length-range", 0, 10 * 1024 * 1024]],
      Fields: {
        acl: 'bucket-owner-full-control',
        key: photoKey
      },
    }
    return this.S3Instance.createPresignedPost(params)
  }

}