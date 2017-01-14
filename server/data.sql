BEGIN TRANSACTION;
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
	`hasIssues` INTEGER,
  	FOREIGN KEY(`idArtist`) REFERENCES People(idPerson),
		FOREIGN KEY(`idAlbumArtist`) REFERENCES People(idPerson),
    FOREIGN KEY(`idAlbum`) REFERENCES Albums(idAlbum),
    FOREIGN KEY(`idGenre`) REFERENCES Genres(idGenre)
);
DROP TABLE IF EXISTS `People`;
CREATE TABLE `People` (
	`idPerson`	INTEGER PRIMARY KEY AUTOINCREMENT,
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
	`idArtist` INTEGER,
	FOREIGN KEY(`idAlbum`) REFERENCES Album(idAlbum),
	FOREIGN KEY(`idArtist`) REFERENCES People(idPerson)
);

DROP TABLE IF EXISTS `PlayLists`;
CREATE TABLE "PlayLists" (
	`idPlayList`	TEXT NOT NULL UNIQUE,
	`name`	TEXT NOT NULL UNIQUE COLLATE NOCASE,
	`lastTrackPlayed`	INTEGER,
	`idTracks`	TEXT DEFAULT '',
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

DROP TABLE IF EXISTS `RemoteFiles`;
CREATE TABLE `RemoteFiles` (
	`idTrack`	INTEGER NOT NULL,
	`idDevice`	INTEGER,
	`location`	TEXT,
	`timeSent`	TEXT DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(idTrack, idDevice),
	FOREIGN KEY(`idTrack`) REFERENCES Tracks ( idTrack ),
	FOREIGN KEY(`idDevice`) REFERENCES Devices(idDevice)
);

DROP TABLE IF EXISTS `PlayListsHistory`;
CREATE TABLE `PlayListsHistory` (
	`idPlayListHistory`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`idPlayList`	TEXT NOT NULL,
	`idDevice`	INTEGER NOT NULL,
	`timeChanged` TEXT DEFAULT CURRENT_TIMESTAMP,
	`name` TEXT,
	`idTracks` TEXT,
	FOREIGN KEY (`idPlayList`) REFERENCES PlayLists(idPlayList),
	FOREIGN KEY (`idDevice`) REFERENCES Devices(idDevice)
);

CREATE INDEX `track_title` ON `Tracks` (`title` ASC);
CREATE INDEX `track_album` ON `Tracks` (`idAlbum` ASC);
CREATE INDEX `artist_name` ON `People` (`artist` ASC);
CREATE INDEX `album_name` ON `Albums` (`album` ASC);
CREATE INDEX `genre_name` ON `Genres` (`genre` ASC);
CREATE INDEX `track_location` ON `Tracks` (`location` ASC);
CREATE INDEX `album_artists` ON `AlbumArtistMap` (`idAlbum` ASC);
CREATE INDEX `device_uuid` ON `Devices` (`uuid` ASC);
CREATE INDEX `playlist_name` ON `PlayLists` (`name` ASC);
CREATE INDEX `playListsHistory_device` ON `PlayListsHistory` (`idDevice` ASC);

DROP VIEW IF EXISTS `AllTracks`;
CREATE VIEW `AllTracks` AS
	select *
		from Tracks
		left join Albums using(idAlbum)
		left join (select artist as albumArtist, idPerson as idAlbumArtist from People) using (idAlbumArtist)
		left join People on idArtist = idPerson
		left join Genres using (idGenre);

DROP VIEW IF EXISTS `AllAlbums`;
CREATE VIEW `AllAlbums` AS
select idAlbum,  album, group_concat(artist) as artists, idArtist, numTracks, idTracks
	from Albums
	left join AlbumArtistMap using(idAlbum)
	left join People on People.idPerson = AlbumArtistMap.idArtist
	left join (
		select idAlbum, count(*) as numTracks, group_concat(idTrack) as idTracks
		from Tracks group by idAlbum
	) using(idAlbum)
	group by album
	order by album;

	DROP VIEW IF EXISTS `AllArtists`;
	CREATE VIEW `AllArtists` as
	select idArtist, artist, numTracks, idTracks from people
		left join (
			select idArtist, count(*) as numTracks, group_concat(idTrack) as idTracks from (
				select idArtist, idTrack from Tracks group by idArtist
				union
				select AlbumArtistMap.idArtist as idArtist, idTrack
				from Tracks
				left join AlbumArtistMap using(idAlbum)
			) group by idArtist
		)  on idPerson = idArtist
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

COMMIT;
