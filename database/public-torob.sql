/*
 Navicat Premium Data Transfer

 Source Server         : Local
 Source Server Type    : PostgreSQL
 Source Server Version : 130004
 Source Host           : localhost:5432
 Source Catalog        : torob_db
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 130004
 File Encoding         : 65001

 Date: 03/07/2022 17:04:46
*/


-- ----------------------------
-- Sequence structure for customer_favorite_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_favorite_id_seq";
CREATE SEQUENCE "public"."customer_favorite_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1000
CACHE 1;
ALTER SEQUENCE "public"."customer_favorite_id_seq" OWNER TO "admin";

-- ----------------------------
-- Sequence structure for customer_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_id_seq";
CREATE SEQUENCE "public"."customer_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1000
CACHE 1;
ALTER SEQUENCE "public"."customer_id_seq" OWNER TO "admin";

-- ----------------------------
-- Sequence structure for otp_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."otp_id_seq";
CREATE SEQUENCE "public"."otp_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1000
CACHE 1;
ALTER SEQUENCE "public"."otp_id_seq" OWNER TO "admin";

-- ----------------------------
-- Sequence structure for product_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."product_id_seq";
CREATE SEQUENCE "public"."product_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1000
CACHE 1;
ALTER SEQUENCE "public"."product_id_seq" OWNER TO "admin";

-- ----------------------------
-- Sequence structure for product_store_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."product_store_id_seq";
CREATE SEQUENCE "public"."product_store_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1000
CACHE 1;
ALTER SEQUENCE "public"."product_store_id_seq" OWNER TO "admin";

-- ----------------------------
-- Sequence structure for report_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."report_id_seq";
CREATE SEQUENCE "public"."report_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1000
CACHE 1;
ALTER SEQUENCE "public"."report_id_seq" OWNER TO "admin";

-- ----------------------------
-- Sequence structure for store_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."store_id_seq";
CREATE SEQUENCE "public"."store_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1000
CACHE 1;
ALTER SEQUENCE "public"."store_id_seq" OWNER TO "admin";

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS "public"."admin";
CREATE TABLE "public"."admin" (
  "id" int4 NOT NULL,
  "username" text COLLATE "pg_catalog"."default",
  "password" text COLLATE "pg_catalog"."default",
  "name" text COLLATE "pg_catalog"."default",
  "phone_number" text COLLATE "pg_catalog"."default",
  "email" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."admin" OWNER TO "admin";

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS "public"."category";
CREATE TABLE "public"."category" (
  "id" int4 NOT NULL,
  "parent_id" int4,
  "title" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."category" OWNER TO "admin";

-- ----------------------------
-- Table structure for customer
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer";
CREATE TABLE "public"."customer" (
  "id" int4 NOT NULL DEFAULT nextval('customer_id_seq'::regclass),
  "username" text COLLATE "pg_catalog"."default",
  "password" text COLLATE "pg_catalog"."default",
  "email" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."customer" OWNER TO "admin";

-- ----------------------------
-- Table structure for customer_favorite
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_favorite";
CREATE TABLE "public"."customer_favorite" (
  "id" int4 NOT NULL DEFAULT nextval('customer_favorite_id_seq'::regclass),
  "customer_id" int4,
  "product_id" int4
)
;
ALTER TABLE "public"."customer_favorite" OWNER TO "admin";

-- ----------------------------
-- Table structure for otp
-- ----------------------------
DROP TABLE IF EXISTS "public"."otp";
CREATE TABLE "public"."otp" (
  "id" int4 NOT NULL DEFAULT nextval('otp_id_seq'::regclass),
  "email" text COLLATE "pg_catalog"."default",
  "code" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."otp" OWNER TO "admin";

-- ----------------------------
-- Table structure for product
-- ----------------------------
DROP TABLE IF EXISTS "public"."product";
CREATE TABLE "public"."product" (
  "id" int4 NOT NULL DEFAULT nextval('product_id_seq'::regclass),
  "title" text COLLATE "pg_catalog"."default",
  "category_id" int4,
  "favorite" bool,
  "photo" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."product" OWNER TO "admin";

-- ----------------------------
-- Table structure for product_store
-- ----------------------------
DROP TABLE IF EXISTS "public"."product_store";
CREATE TABLE "public"."product_store" (
  "id" int4 NOT NULL DEFAULT nextval('product_store_id_seq'::regclass),
  "store_id" int4,
  "product_id" int4,
  "price" text COLLATE "pg_catalog"."default",
  "url" text COLLATE "pg_catalog"."default",
  "row_creation_time" timestamptz(6) DEFAULT timezone('utc'::text, now())
)
;
ALTER TABLE "public"."product_store" OWNER TO "admin";

-- ----------------------------
-- Table structure for report
-- ----------------------------
DROP TABLE IF EXISTS "public"."report";
CREATE TABLE "public"."report" (
  "id" int4 NOT NULL DEFAULT nextval('report_id_seq'::regclass),
  "store_id" int4,
  "description" text COLLATE "pg_catalog"."default",
  "customer_id" int4,
  "product_id" int4
)
;
ALTER TABLE "public"."report" OWNER TO "admin";

-- ----------------------------
-- Table structure for store
-- ----------------------------
DROP TABLE IF EXISTS "public"."store";
CREATE TABLE "public"."store" (
  "id" int4 NOT NULL DEFAULT nextval('store_id_seq'::regclass),
  "admin_id" int4 NOT NULL,
  "name" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."store" OWNER TO "admin";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."customer_favorite_id_seq"', 1011, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."customer_id_seq"', 1008, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."otp_id_seq"', 1005, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."product_id_seq"', 1005, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."product_store_id_seq"', 1002, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."report_id_seq"', 1015, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."store_id_seq"', 1007, true);

-- ----------------------------
-- Primary Key structure for table admin
-- ----------------------------
ALTER TABLE "public"."admin" ADD CONSTRAINT "admin_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table category
-- ----------------------------
ALTER TABLE "public"."category" ADD CONSTRAINT "category_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table customer
-- ----------------------------
ALTER TABLE "public"."customer" ADD CONSTRAINT "customer_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table customer_favorite
-- ----------------------------
ALTER TABLE "public"."customer_favorite" ADD CONSTRAINT "customer_favorite_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table otp
-- ----------------------------
ALTER TABLE "public"."otp" ADD CONSTRAINT "otp_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table product
-- ----------------------------
ALTER TABLE "public"."product" ADD CONSTRAINT "product_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table product_store
-- ----------------------------
ALTER TABLE "public"."product_store" ADD CONSTRAINT "product_store_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table report
-- ----------------------------
ALTER TABLE "public"."report" ADD CONSTRAINT "report_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table store
-- ----------------------------
ALTER TABLE "public"."store" ADD CONSTRAINT "store_pkey" PRIMARY KEY ("id");
