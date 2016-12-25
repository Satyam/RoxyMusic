import React, { PropTypes } from 'react';
import Icon from '_components/misc/icon';

export const Artist = ({
  className,
  idArtist,
  artist,
  children,
}) => (
  <div className={className}>
    <Icon
      type="user"
      href={idArtist && `/artists/${idArtist}`}
      label={artist || '--'}
    />
    {children}
  </div>
);

Artist.propTypes = {
  className: PropTypes.string,
  idArtist: PropTypes.number,
  artist: PropTypes.string,
  children: PropTypes.node,
};

export const Album = ({
  className,
  idAlbum,
  album,
  children,
}) => (
  <div className={className}>
    <Icon
      type="cd"
      href={idAlbum && `/albums/${idAlbum}`}
      label={album || '--'}
    />
    {children}
  </div>
);

Album.propTypes = {
  className: PropTypes.string,
  idAlbum: PropTypes.number,
  album: PropTypes.string,
  children: PropTypes.node,
};

export const Song = ({
  className,
  idTrack,
  title,
  children,
}) => (
  <div className={className}>
    <Icon
      type="music"
      href={idTrack && `/songs/${idTrack}`}
      label={title}
    />
    {children}
  </div>
);

Song.propTypes = {
  className: PropTypes.string,
  idTrack: PropTypes.number,
  title: PropTypes.string,
  children: PropTypes.node,
};
