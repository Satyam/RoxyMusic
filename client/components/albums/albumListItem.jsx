import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';
import { Album, Artist } from '_components/entries';
import Icon from '_components/misc/icon';

import {
  playAlbumNow,
  addAlbumToPlayNow,
  replaceAlbumInPlayNow,
  addAlbumToPlayList,
} from '_store/actions';

import { albumSelectors } from '_store/selectors';

import styles from './albumListItem.css';

export const AlbumListItemComponent = ({
  idAlbum,
  album,
  artists,
  idArtist,
  onPlayNowClick,
  onAddToPlayNowClick,
  onReplacePlayNowClick,
  onAddToPlayList,
}) => (
  <ListGroupItem className={styles.li}>
    <div className={styles.left}>
      <Album
        className={styles.album}
        idAlbum={idAlbum}
        album={album}
      />
      <Artist
        className={styles.artists}
        idArtist={idArtist}
        artist={artists}
      />
    </div>
    <FoldingToolbar>
      <Icon button type="play" label="!" onClick={onPlayNowClick} title="play now" />
      <Icon button type="play,plus" onClick={onAddToPlayNowClick} title="Play later" />
      <Icon
        button
        type="remove-sign,play"
        onClick={onReplacePlayNowClick}
        title="Clear list and play this"
      />
      <Icon button type="indent-left" onClick={onAddToPlayList} title="add to PlayList" />
    </FoldingToolbar>
  </ListGroupItem>
);


AlbumListItemComponent.propTypes = {
  idAlbum: PropTypes.number.isRequired,
  album: PropTypes.string,
  artists: PropTypes.string,
  idArtist: PropTypes.number,
  onPlayNowClick: PropTypes.func,
  onAddToPlayNowClick: PropTypes.func,
  onReplacePlayNowClick: PropTypes.func,
  onAddToPlayList: PropTypes.func,
};

export const mapStateToProps = (state, props) =>
  albumSelectors.item(state, props.idAlbum);

export const mapDispatchToProps = (dispatch, { idAlbum }) => ({
  onPlayNowClick: () => dispatch(playAlbumNow(idAlbum)),
  onAddToPlayNowClick: () => dispatch(addAlbumToPlayNow(idAlbum)),
  onReplacePlayNowClick: () => dispatch(replaceAlbumInPlayNow(idAlbum)),
  onAddToPlayList: () => dispatch(addAlbumToPlayList(idAlbum)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlbumListItemComponent);
