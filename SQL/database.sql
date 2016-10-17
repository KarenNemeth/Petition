DROP TABLE signatures CASCADE;
DROP TABLE users CASCADE;
DROP TABLE user_profiles CASCADE;
CREATE TABLE users (
	ID SERIAL primary key,
	Created TIMESTAMP DEFAULT now(),
	FirstName VARCHAR(225) not null,
	LastName VARCHAR(225) not null,
	Email VARCHAR(225) not null UNIQUE,
	Password TEXT not null
);
CREATE TABLE signatures (
	ID SERIAL primary key,
	User_ID INT references users(ID),
    Created TIMESTAMP DEFAULT now(),
	Signature TEXT not null
);
CREATE TABLE user_profiles (
	ID SERIAL primary key,
	User_ID INT references users(ID),
	Age INT,
	City VARCHAR(225),
	URL TEXT
);
