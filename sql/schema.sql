
-- Gott að hafa inni þegar við erum hugsanlega að henda og búa til aftur og aftur
DROP TABLE IF EXISTS signatures;

CREATE TABLE IF NOT EXISTS signatures(
  id serial primary key,
  name varchar(128) not null,
  nationalId varchar(10) not null unique,
  comment varchar(400) not null,
  anonymous boolean not null default true,
  signed timestamp with time zone not null default current_timestamp
);

-- TODO setja inn töflu fyrir notendur
