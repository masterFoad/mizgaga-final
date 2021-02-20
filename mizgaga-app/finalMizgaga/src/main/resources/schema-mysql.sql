create schema if not exists mizgaga_db collate utf8mb4_0900_ai_ci;
use mizgaga_db;
create table faces
(
    id int auto_increment
        primary key,
    face int null
);

create table session_vectors
(
    id int auto_increment
        primary key,
    creation_time timestamp default CURRENT_TIMESTAMP null,
    actual_time timestamp null,
    x double null,
    y double null,
    z double null,
    w double null
);

