export type StripeRequestBody = {
  successLink: string;
  failLink: string;
  albumID: string;
  phone: string;
};

export type PhotoRecord = {
  successLink: string;
  failLink: string;
  albumID: string;
  phoneNumber: string;
};

export type UserPhoto = {
  photoID: string;
  albumID: string;
  login: string;
  albumName: string;
  albumDate: string;
  location: string;
};

export type AlbumPhoto = {
    photoID: string;
    albumID: string;
    login: string;
    albumName: string;
    albumDate: string;
    location: string;
  };

export type PhotoS3Data = {
  photoID: string;
  key: string;
}

export type UserAlbums = {
  albumID: string;
  key: string;
  location: string;
  date: string;
  name: string;
}

export type AlbumsResponse = {
  albumID: string;
  name: string;
  date: string;
  location: string;
  isPaid: boolean;
  url: string;
}

export type PhotoResponse = {
  photoID: string;
  url: string;
}
