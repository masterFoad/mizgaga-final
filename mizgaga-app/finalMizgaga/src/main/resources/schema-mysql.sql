create schema if not exists mizgaga_db collate utf8mb4_0900_ai_ci;
use mizgaga_db;
create table if not exists faces
(
    id int auto_increment
        primary key,
    face int null
);

