create table _user (user_id binary(16) not null, email varchar(255) not null, password varchar(255) not null, role enum ('ADMIN','USER'), primary key (user_id)) engine=InnoDB;
alter table _user add constraint UKk11y3pdtsrjgy8w9b6q4bjwrx unique (email);

create table _user (user_id binary(16) not null, email varchar(255) not null, password varchar(255), provider varchar(255), provider_id varchar(255), role enum ('ADMIN','USER'), primary key (user_id)) engine=InnoDB;
alter table _user add constraint UKk11y3pdtsrjgy8w9b6q4bjwrx unique (email);
