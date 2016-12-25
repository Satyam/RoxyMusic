export default function splitIdTracks(record) {
  return Object.assign(record, {
    idTracks: (
      record.idTracks
      ? record.idTracks.split(',').map(idTrack => parseInt(idTrack, 10))
      : []
    ),
  });
}
