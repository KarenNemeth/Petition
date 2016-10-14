DROP TABLE signatures;
DROP TABLE users;
DROP TABLE user_profiles;
CREATE TABLE users (
	ID SERIAL primary key,
	Created TIMESTAMP DEFAULT now(),
	FirstName VARCHAR(225) not null,
	LastName VARCHAR(225) not null,
	Email VARCHAR(225) not null UNIQUE,
	Password TEXT not null
);
CREATE TABLE signatures (
	id SERIAL primary key,
	User_ID INT references users(ID),
    Created TIMESTAMP DEFAULT now(),
	FirstName VARCHAR(225) not null,
	LastName VARCHAR(225) not null,
	Signature TEXT not null
);
CREATE TABLE user_profiles (
	ID SERIAL primary key,
	User_ID INT references users(ID),
	Age INT,
	City VARCHAR(225),
	URL TEXT
);
