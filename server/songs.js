let prepared = {};

export function init(db) {
  return db.prepareAll({
    getSongs: 'select idTrack, title from Tracks order by title limit $count offset $offset',
    searchSongs: 'select idTrack, title from Tracks where title like $search order by title limit $count offset $offset',
  })
  .then((p) => {
    prepared = p;
  });
}

// getSongs: 'select idTrack, title from Tracks order by title limit $count offset $offset',
// searchSongs: 'select idTrack, title from Tracks
// where artist like $search order by title limit $count offset $offset',
export function getSongs(o) {
  return (
    o.options.search
    ? prepared.searchSongs.all({
      count: o.options.count || 20,
      offset: o.options.offset || 0,
      search: `%${o.options.search}%`,
    })
    : prepared.getSongs.all({
      count: o.options.count || 20,
      offset: o.options.offset || 0,
    })
  )
  .then(list => ({ list }));
}

export default db =>
  init(db)
  .then(() => ({
    '/': {
      read: getSongs,
    },
  }));
