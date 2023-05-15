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
  public getSelfieUrl = async (photoKey: string) => {
    const params = {
      Bucket: this.bucketName,
      Key: photoKey,
    }
    try {
      await this.S3Instance.headObject(params).promise();
      return this.S3Instance.getSignedUrl('getObject', params);
    } catch (error) {
      return null
    }
  }

  public getPhotoUrl = (photoKey: string) => {
    const splittedKey = photoKey.split("/")
    const filename = splittedKey[splittedKey.length-1]
    const contentDisposition = `attachment; filename=${filename}`;
    const params = {
      Bucket: this.bucketName,
      Key: photoKey,
      ResponseContentDisposition: contentDisposition,
      Expires: 60,
    }
    return this.S3Instance.getSignedUrl('getObject',params)
  }

  public changeSelfiePhone = async (oldPhone: string, newPhone: string) => {
    const paramsCopy = {
      Bucket: this.bucketName,
      Key: `selfies1/${newPhone}.jpeg`,
      CopySource: `${this.bucketName}/selfies1/${oldPhone}.jpeg`
    }

    const paramsDelete = {
      Bucket: this.bucketName,
      Key: `selfies1/${oldPhone}.jpeg`,
    }
    try{
      await this.S3Instance.copyObject(paramsCopy).promise()
      await this.S3Instance.deleteObject(paramsDelete).promise()
    } catch(err) {
      console.log(err)
    }
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