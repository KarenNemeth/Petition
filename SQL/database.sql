DROP TABLE signatures;
CREATE TABLE signatures (
	id SERIAL primary key,
    Created TIMESTAMP not null DEFAULT now(),
	FirstName VARCHAR(225) not null,
	LastName VARCHAR(225) not null,
	Signature TEXT
);
