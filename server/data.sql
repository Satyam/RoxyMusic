BEGIN TRANSACTION;
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
	`key`	TEXT PRIMARY KEY,
	`value`	TEXT,
	`type`	INTEGER
);

INSERT INTO `config` (key, value, type) values
 ('musicDir', '/home/satyam/Music', 0),
 ('audioExtensions', 'mp3,mp4,m4a,wav,wma,flac', 0);

DROP TABLE IF EXISTS `Tracks`;
CREATE TABLE `Tracks` (
	`idTrack`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`title`	TEXT,
	`idArtist`	INTEGER,
	`idComposer`	INTEGER,
	`idAlbumArtist` INTEGER,
	`idAlbum`	INTEGER,
	`track` INTEGER,
	`date`	INTEGER,
	`idGenre`	INTEGER,
  `location` TEXT,
  `fileModified` TEXT,
	`hasIssues` INTEGER,
  	FOREIGN KEY(`idArtist`) REFERENCES People(idPerson),
    FOREIGN KEY(`idComposer`) REFERENCES People(idPerson),
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
CREATE INDEX `track_title` ON `Tracks` (`title` ASC);
CREATE INDEX `artist_name` ON `People` (`artist` ASC);
CREATE INDEX `album_name` ON `Albums` (`album` ASC);
CREATE INDEX `genre_name` ON `Genres` (`genre` ASC);
CREATE INDEX `track_location` ON `Tracks` (`location` ASC);

CREATE VIEW `AllTracks` AS
	select * from Tracks
		left join Albums using(idAlbum)
		left join (select artist as composer, idPerson as idComposer from People) using (idComposer)
		left join (select artist as albumArtist, idPerson as idAlbumArtist from People) using (idAlbumArtist)
		left join People on idArtist = idPerson
		left join Genres using (idGenre);

COMMIT;
