CREATE TABLE IF NOT EXISTS signatures(
  id serial primary key,
  name varchar(128) not null,
  nationalId varchar(10) not null unique,
  comment text not null,
  anonymous boolean not null default true,
  signed timestamp with time zone not null default current_timestamp
);
