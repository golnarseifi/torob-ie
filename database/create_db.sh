#!/bin/sh
set -xe

DB="torob_db"

psql -d "postgres" -c "DROP ROLE IF EXISTS \"admin\""
psql -d "postgres" -c "CREATE ROLE \"admin\" WITH SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN PASSWORD '123456';"

psql -d "postgres" -U admin -c "DROP DATABASE IF EXISTS $DB;"  ;
psql -d "postgres" -U admin -c "CREATE DATABASE $DB OWNER admin ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8' TEMPLATE template0;"  ;

psql $DB < public.sql

