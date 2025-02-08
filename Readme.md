1. การเตรียมฐานข้อมูล ก่อนการสร้างโปรเจค
ขั้นตอน:
  1. เปิด MariaDB และเข้าสู่ระบบ
  2. สร้างฐานข้อมูลใหม่:
   ```sql
   CREATE DATABASE app;
  3.สร้าง table แต้ละอัน ด้วยคำสั่ง 
    3.1 CREATE TABLE posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age VARCHAR(50) NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        adopt ENUM('Dog', 'Cat', 'Dog And Cat') NOT NULL,
        phone VARCHAR(20) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(255) NOT NULL, -- เก็บ path ของรูปภาพ
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    3.2 CREATE TABLE pet_owner (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        pet_name VARCHAR(100) NOT NULL,
        age_group VARCHAR(50) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        pick_up_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    3.3 CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        phone_number VARCHAR(15),
        gender ENUM('Male', 'Female', 'Other'),
        subscribe BOOLEAN DEFAULT 0
        );
2. การ import โปรเจค
   หลังจากเตรียมฐานข้อมูลเสร็จแล้ว คุณสามารถ import โปรเจคได้ตามขั้นตอนนี้
        ขั้นตอน:
        ดาวน์โหลดโปรเจคจาก repository
        เปิดโปรเจคด้วย IDE (เช่น Android Studio, Visual Studio Code)
        ใน IDE ให้เปิดไฟล์ pubspec.yaml และติดตั้ง dependencies ด้วยคำสั่ง:
        flutter pub get
3. การตั้งค่าฐานข้อมูล
    หลังจากที่โปรเจคถูก import แล้ว คุณต้องตั้งค่าการเชื่อมต่อกับฐานข้อมูลในโปรเจค
    ขั้นตอน:
    เปิดไฟล์ที่เก็บการตั้งค่าฐานข้อมูล server.js
    แก้ไขข้อมูลการเชื่อมต่อกับ MariaDB
4. คำสั่ง Build โปรเจค
    เมื่อคุณทำการตั้งค่าทุกอย่างเรียบร้อยแล้ว คุณสามารถทำการ build โปรเจคได้
    ขั้นตอน:
    1. ใน terminal ให้ใช้คำสั่ง flutter build apk
5. การรัน Emulator หรือโทรศัพท์ Android
    หลังจาก build สำเร็จ คุณสามารถรันโปรเจคบน Emulator หรือโทรศัพท์ Android ได้
    ขั้นตอน:
    เปิด Android Emulator หรือเชื่อมต่อโทรศัพท์ Android เข้ากับคอมพิวเตอร์
    ใน terminal ให้ใช้คำสั่ง
     flutter run