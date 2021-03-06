DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
	`key`	TEXT PRIMARY KEY,
	`value`	TEXT,
	`type`	INTEGER
);

INSERT INTO `config` (key, value, type) values
 ('musicDir', '/home/satyam/Music', 0),
 ('audioExtensions', 'mp3,mp4,m4a,wav,wma,flac', 0),
 ('portableAudioExtensions', 'mp3,mp4,m4a,flac', 0),
 ('nowPlaying', '{"current": -1, "idTracks": []}', 5),
 ('remoteHost', 'http://192.168.0.101:8080', 0);

DROP TABLE IF EXISTS `Tracks`;
CREATE TABLE `Tracks` (
	`idTrack`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`title`	TEXT,
	`idArtist`	INTEGER,
	`idAlbumArtist` INTEGER,
	`idAlbum`	INTEGER,
	`track` INTEGER,
	`year`	INTEGER,
	`duration` INTEGER,
	`idGenre`	INTEGER,
	`location` TEXT,
	`fileModified` TEXT,
	`size` INTEGER,
	`ext` TEXT,
	`hasIssues` INTEGER
);

DROP TABLE IF EXISTS `Artists`;
CREATE TABLE `Artists` (
	`idArtist`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`artist`	TEXT NOT NULL UNIQUE
);

DROP TABLE IF EXISTS `Albums`;
CREATE TABLE `Albums` (
	`idAlbum`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`album`	TEXT NOT NULL UNIQUE
);
DROP TABLE IF EXISTS `Genres`;
CREATE TABLE `Genres` (
  `idGenre` INTEGER PRIMARY KEY AUTOINCREMENT,
  `genre` TEXT NOT NULL UNIQUE
);

DROP TABLE IF EXISTS `AlbumArtistMap`;
CREATE TABLE `AlbumArtistMap` (
	`idAlbumArtistMap` INTEGER PRIMARY KEY AUTOINCREMENT,
	`idAlbum` INTEGER,
	`idArtist` INTEGER
);

DROP TABLE IF EXISTS `PlayLists`;
CREATE TABLE "PlayLists" (
	`idPlayList`	TEXT NOT NULL UNIQUE,
	`name`	TEXT UNIQUE COLLATE NOCASE,
	`lastTrackPlayed`	INTEGER,
	`idTracks`	TEXT DEFAULT '',
	`lastUpdated`	TEXT DEFAULT CURRENT_TIMESTAMP,
	`idDevice` INTEGER,
	PRIMARY KEY(idPlayList)
);

DROP TABLE IF EXISTS `Devices`;
CREATE TABLE `Devices` (
	`idDevice`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`uuid`	TEXT UNIQUE,
	`musicDir` TEXT
);

INSERT INTO `Devices` (idDevice, uuid) values (0, 'local');
INSERT INTO `Devices` (idDevice, uuid, musicDir) values (
	1,
	'Android SDK built for x86_64 : 1c0ca6e5a8f452bb',
	'file:///storage/sdcard/Music'
);

DROP INDEX IF EXISTS `track_title`;
CREATE INDEX `track_title` ON `Tracks` (`title` ASC);
DROP INDEX IF EXISTS `track_album`;
CREATE INDEX `track_album` ON `Tracks` (`idAlbum` ASC);
DROP INDEX IF EXISTS `artist_name`;
CREATE INDEX `artist_name` ON `Artists` (`artist` ASC);
DROP INDEX IF EXISTS `album_name`;
CREATE INDEX `album_name` ON `Albums` (`album` ASC);
DROP INDEX IF EXISTS `genre_name`;
CREATE INDEX `genre_name` ON `Genres` (`genre` ASC);
DROP INDEX IF EXISTS `track_location`;
CREATE INDEX `track_location` ON `Tracks` (`location` ASC);
DROP INDEX IF EXISTS `album_artists`;
CREATE INDEX `album_artists` ON `AlbumArtistMap` (`idAlbum` ASC);
DROP INDEX IF EXISTS `device_uuid`;
CREATE INDEX `device_uuid` ON `Devices` (`uuid` ASC);
DROP INDEX IF EXISTS `playlist_name`;
CREATE INDEX `playlist_name` ON `PlayLists` (`name` ASC);

DROP VIEW IF EXISTS `AllTracks`;
CREATE VIEW `AllTracks` AS
	select *
		from Tracks
		left join Albums using (idAlbum)
		left join (select artist as albumArtist, idArtist as idAlbumArtist from Artists) using (idAlbumArtist)
		left join Artists using (idArtist)
		left join Genres using (idGenre)
		where title is not null;

DROP VIEW IF EXISTS `AllAlbums`;
CREATE VIEW `AllAlbums` AS
select idAlbum,  album, group_concat(artist) as artists, idArtist, numTracks, idTracks
	from Albums
	left join AlbumArtistMap using (idAlbum)
	left join Artists using (idArtist)
	left join (
		select idAlbum, count(*) as numTracks, group_concat(idTrack) as idTracks
		from Tracks where title is not null group by idAlbum
	) using (idAlbum)
	group by album
	order by album;

DROP VIEW IF EXISTS `AllArtists`;
CREATE VIEW `AllArtists` as
select idArtist, artist, numTracks, idTracks from Artists
	left join (
		select idArtist, count(*) as numTracks, group_concat(idTrack) as idTracks from (
			select idArtist, idTrack from Tracks where title is not null group by idArtist
			union
			select AlbumArtistMap.idArtist as idArtist, idTrack
			from Tracks
			left join AlbumArtistMap using (idAlbum)
			where title is not null
		) group by idArtist
	)  using (idArtist)
	order by artist;

INSERT INTO `Genres` (idGenre, genre) VALUES
 (0, 'Blues'),
 (1, 'Classic Rock'),
 (2, 'Country'),
 (3, 'Dance'),
 (4, 'Disco'),
 (5, 'Funk'),
 (6, 'Grunge'),
 (7, 'Hip-Hop'),
 (8, 'Jazz'),
 (9, 'Metal'),
(10, 'New Age'),
(12, 'Other'),
(11, 'Oldies'),
(13, 'Pop'),
(14, 'R&B'),
(15, 'Rap'),
(16, 'Reggae'),
(17, 'Rock'),
(18, 'Techno'),
(19, 'Industrial'),
(20, 'Alternative'),
(21, 'Ska'),
(22, 'Death Metal'),
(23, 'Pranks'),
(24, 'Soundtrack'),
(25, 'Euro-Techno'),
(26, 'Ambient'),
(27, 'Trip-Hop'),
(28, 'Vocal'),
(29, 'Jazz+Funk'),
(30, 'Fusion'),
(31, 'Trance'),
(32, 'Classical'),
(33, 'Instrumental'),
(34, 'Acid'),
(35, 'House'),
(36, 'Game'),
(37, 'Sound Clip'),
(38, 'Gospel'),
(39, 'Noise'),
(40, 'AlternRock'),
(41, 'Bass'),
(42, 'Soul'),
(43, 'Punk'),
(44, 'Space'),
(45, 'Meditative'),
(46, 'Instrumental Pop'),
(47, 'Instrumental Rock'),
(48, 'Ethnic'),
(49, 'Gothic'),
(50, 'Darkwave'),
(51, 'Techno-Industrial'),
(52, 'Electronic'),
(53, 'Pop-Folk'),
(54, 'Eurodance'),
(55, 'Dream'),
(56, 'Southern Rock'),
(57, 'Comedy'),
(58, 'Cult'),
(59, 'Gangsta'),
(60, 'Top 40'),
(61, 'Christian Rap'),
(62, 'Pop/Funk'),
(63, 'Jungle'),
(64, 'Native American'),
(65, 'Cabaret'),
(66, 'New Wave'),
(67, 'Psychadelic'),
(68, 'Rave'),
(69, 'Showtunes'),
(70, 'Trailer'),
(71, 'Lo-Fi'),
(72, 'Tribal'),
(73, 'Acid Punk'),
(74, 'Acid Jazz'),
(75, 'Polka'),
(76, 'Retro'),
(77, 'Musical'),
(78, 'Rock & Roll'),
(79, 'Hard Rock'),
(80, 'Folk'),
(81, 'Folk-Rock'),
(82, 'National Folk'),
(83, 'Swing'),
(84, 'Fast Fusion'),
(85, 'Bebob'),
(86, 'Latin'),
(87, 'Revival'),
(88, 'Celtic'),
(89, 'Bluegrass'),
(91, 'Gothic Rock'),
(92, 'Progressive Rock'),
(90, 'Avantgarde'),
(94, 'Symphonic Rock'),
(93, 'Psychedelic Rock'),
(95, 'Slow Rock'),
(96, 'Big Band'),
(97, 'Chorus'),
(98, 'Easy Listening'),
(99, 'Acoustic'),
(100, 'Humour'),
(102, 'Chanson'),
(103, 'Opera'),
(101, 'Speech'),
(104, 'Chamber Music'),
(105, 'Sonata'),
(106, 'Symphony'),
(107, 'Booty Bass'),
(108, 'Primus'),
(109, 'Porn Groove'),
(110, 'Satire'),
(111, 'Slow Jam'),
(112, 'Club'),
(113, 'Tango'),
(114, 'Samba'),
(115, 'Folklore'),
(116, 'Ballad'),
(117, 'Power Ballad'),
(118, 'Rhythmic Soul'),
(119, 'Freestyle'),
(120, 'Duet'),
(122, 'Drum Solo'),
(121, 'Punk Rock'),
(123, 'A capella'),
(124, 'Euro-House'),
(125, 'Dance Hall');
