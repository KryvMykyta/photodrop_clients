import { UserAlbums, PhotoS3Data, AlbumPhoto } from "./../types/types";


export class DataFormatter {
  public getAlbumsOfUser = (photosRecords: AlbumPhoto[]): UserAlbums[] => {
    const albums = [
      ...new Set(
        photosRecords.map((photoRecord) => {
          return photoRecord.albumID;
        })
      ),
    ];
    const cacheAlbums: { [key: string]: AlbumPhoto[] } = {};
    albums.map((album) => {
      if (!Object.keys(cacheAlbums).includes(album)) {
        cacheAlbums[album] = photosRecords.filter(
          (record) => record.albumID === album
        );
      }
    });
    const uniqueAlbumRecords = Object.values(cacheAlbums);
    const albumsResponse = uniqueAlbumRecords.map((record) => {
      return {
        albumID: record[0].albumID,
        key: `${record[0].login}/${record[0].albumID}/${record[0].photoID}`,
        location: record[0].location,
        date: record[0].albumDate,
        name: record[0].albumName,
      };
    });
    return albumsResponse;
  };

  public getAlbumPhotos = (
    photosRecords: AlbumPhoto[],
    albumID: string,
    isBought: boolean
  ): PhotoS3Data[] => {
    const records = photosRecords
      .filter((photoRecord) => albumID === photoRecord.albumID)
      .map((photoRecord) => {
        if (isBought) {
          return {
            photoID: photoRecord.photoID,
            key: `thumbnail/${photoRecord.login}/${albumID}/${photoRecord.photoID}`,
          };
        }
        return {
          photoID: photoRecord.photoID,
          key: `full/${photoRecord.login}/${albumID}/${photoRecord.photoID}`,
        };
      });
    return records;
  };
}
