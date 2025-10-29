alter table _user
    modify column password varchar(255) null,
    add column provider varchar(255) null,
    add column provider_id varchar(255) null;