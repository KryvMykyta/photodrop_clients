import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { UtilsClasses } from "./../app";
import { Request, Response } from "express";
import { TokenGenerator } from "./../utils/Tokens";
import { OtpRepository } from "./../repository/OtpsRepository";
import { UsersRepository } from "./../repository/UsersRepository";
import { PhotoRepository } from "./../repository/PhotosRepository";
import { DataFormatter } from "./../utils/DataFormatter";
import { S3Repository } from "./../s3/S3";
import { AlbumsResponse, PhotoResponse, AlbumPhoto } from "types/types";

export class PhotosController {
  tokenGenerator: TokenGenerator;
  otpRepository: OtpRepository;
  usersRepository: UsersRepository;
  photoRepository: PhotoRepository;
  s3: S3Repository;
  constructor(utilsClasses: UtilsClasses) {
    this.s3 = utilsClasses.s3;
    this.usersRepository = utilsClasses.usersRepository;
    this.tokenGenerator = utilsClasses.tokenGenerator;
    this.otpRepository = utilsClasses.otpRepository;
    this.photoRepository = utilsClasses.photoRepository;
  }

  public getPhoto = async (
    req: Request<{}, {}, { phone: string }, { photoID: string }>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const { photoID } = req.query;
      if (!phone || !photoID) {
        throw new ErrorGenerator(502, "Bad request");
      }
      const photo = await this.photoRepository.getPhoto(photoID);
      const { albumID, photographerLogin } = photo;
      const isBought = await this.usersRepository.isBoughtAlbum(phone, albumID);
      const photoKey = isBought
        ? `original/${photographerLogin}/${albumID}/${photoID}`
        : `watermark/${photographerLogin}/${albumID}/${photoID}`;
      const responseURL = this.s3.getPhotoUrl(photoKey);
      return res.status(200).send(responseURL);
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

  public getPhotosInAlbum = async (
    req: Request<{}, {}, { phone: string }, { albumID: string }>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const { albumID } = req.query;
      if (!albumID) throw new ErrorGenerator(502, "Bad request");
      const photos = await this.photoRepository.getUsersPhotos(phone);
      const isBought = await this.usersRepository.isBoughtAlbum(phone, albumID);
      const formattedRecords = new DataFormatter().getAlbumPhotos(
        photos,
        albumID,
        isBought
      );
      const photosResponse = formattedRecords.map((record) => {
        return {
          photoID: record.photoID,
          url: this.s3.getPhotoUrl(record.key),
        };
      });

      return res.status(200).send(photosResponse);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };

  public getAlbums = async (
    req: Request<{}, {}, { phone: string }, {}>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const user = await this.usersRepository.getUserByPhone(phone);
      const { email, name } = user[0];
      const photos = await this.photoRepository.getUsersPhotos(phone);
      const uniqueAlbums = new DataFormatter().getAlbumsOfUser(photos);

      const boughtAlbums = await this.usersRepository.getBoughtAlbums(phone);
      const responseAlbums: AlbumsResponse[] = uniqueAlbums.map((album) => {
        return {
          albumID: album.albumID,
          name: album.name,
          date: album.date,
          location: album.location,
          isPaid: boughtAlbums.includes(album.albumID),
          url: this.s3.getPhotoUrl(`thumbnail/${album.key}`),
        };
      });

      let allPhotosUrls: PhotoResponse[] = [];
      uniqueAlbums.map((album) => {
        const formattedRecords = new DataFormatter().getAlbumPhotos(
          photos,
          album.albumID,
          boughtAlbums.includes(album.albumID)
        );
        const photosResponse = formattedRecords.map((record) => {
          return {
            photoID: record.photoID,
            albumID: album.albumID,
            url: this.s3.getPhotoUrl(record.key),
          };
        });
        allPhotosUrls = [...allPhotosUrls, ...photosResponse];
      });

      const response = {
        albums: responseAlbums,
        user: {
          phone,
          email,
          name,
          selfieUrl: await this.s3.getSelfieUrl(`selfies1/${phone}.jpeg`),
        },
        allPhotos: allPhotosUrls,
      };
      return res.status(200).send(response);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}
