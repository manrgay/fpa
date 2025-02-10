const express = require('express');
const mysql = require('mysql2'); // ใช้ mysql2 แทน mariadb
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// ตั้งค่าการเชื่อมต่อกับ MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'app',
  connectionLimit: 5,
  port: 3307, // ตรวจสอบพอร์ตว่าถูกต้องหรือไม่
  charset: "utf8mb4"
});

// Configure multer to store images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ฟังก์ชันสำหรับการ login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // ตรวจสอบว่ามีการส่งข้อมูล email และ password มาในคำขอหรือไม่
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    // ค้นหาผู้ใช้ในฐานข้อมูล
    const [results] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    // ตรวจสอบว่ามีผู้ใช้หรือไม่
    if (results.length === 0) {
      return res.status(400).send({ message: 'User not found' });
    }

    const user = results[0];

    // ตรวจสอบรหัสผ่านที่เข้ารหัส
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send({ message: 'Incorrect password' });
    }

    // สร้าง JWT Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ token }); // ส่ง token กลับไปที่ client
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).send({ message: 'Server error' });
  }
});

// ฟังก์ชันสำหรับการตรวจสอบ JWT Token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // รับค่า token จาก header
  
  if (!token) {
    return res.status(403).json({ message: 'Access denied: No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Access denied: Invalid token' });
    }
  
    req.user = user;
    next();
  });
};

// API สำหรับดึงข้อมูลโปรไฟล์
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT email, first_name FROM users WHERE id = ?', [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err); // Log ข้อผิดพลาด
    res.status(500).json({ message: 'Server error' });
  }
});

// API สำหรับการสมัครสมาชิก
app.post('/register', (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, gender, subscribe } = req.body;

  // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
  pool.promise().query('SELECT * FROM users WHERE email = ?', [email])
    .then(([results]) => {
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // เข้ารหัสรหัสผ่าน
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: 'Error hashing password' });
        }

        // สร้างผู้ใช้ใหม่
        const query = 'INSERT INTO users (first_name, last_name, email, password, phone_number, gender, subscribe) VALUES (?, ?, ?, ?, ?, ?, ?)';
        pool.promise().query(query, [firstName, lastName, email, hashedPassword, phoneNumber, gender, subscribe])
          .then(([result]) => {
            return res.status(201).json({ message: 'User registered successfully' });
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ message: 'Error registering user' });
          });
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: 'Error checking email' });
    });
});

// API สำหรับการส่งฟอร์ม
app.post('/submit-form', async (req, res) => {
  const { name, petName, age, gender, category, phone, email, pickupDate } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || !petName || !age || !gender || !category || !phone || !email || !pickupDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // ตรวจสอบว่าอีเมลถูกต้องหรือไม่
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // ตรวจสอบอีเมลที่มีอยู่ในฐานข้อมูล
  const emailCheckQuery = 'SELECT COUNT(*) AS count FROM pet_owner WHERE email = ?';
  try {
    const [rows] = await pool.promise().query(emailCheckQuery, [email]);
    if (rows[0].count > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // SQL query สำหรับการเพิ่มข้อมูล
    const query = 'INSERT INTO pet_owner (name, pet_name, age_group, gender, category, phone, email, pick_up_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [name, petName, age, gender, category, phone, email, pickupDate];

    // ใช้ pool.promise().query แทน pool.execute
    const [insertResult] = await pool.promise().query(query, values);

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// API สำหรับการโพสต์ข้อมูล
app.post('/posts', upload.single('image'), async (req, res) => {
  const { name, age, gender, adopt, phone, price } = req.body;
  const image = req.file ? req.file.path : null; // เส้นทางไฟล์ภาพ

  try {
    // บันทึกข้อมูลในฐานข้อมูล MySQL
    const [rows] = await pool.promise().query(
      'INSERT INTO posts (name, age, gender, adopt, phone, price, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, age, gender, adopt, phone, price, image]
    );

    res.status(200).json({
      message: 'Data saved successfully!',
      data: { name, age, gender, adopt, phone, price, image }
    });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ message: 'Error saving data to the database' });
  }
});

// API สำหรับการดึงข้อมูลเจ้าของสัตว์
app.get('/pet-owners', async (req, res) => {
  try {
    const userEmail = req.query.email;

    let query = 'SELECT * FROM pet_owner';
    let queryParams = [];

    if (userEmail) {
      query += ' WHERE email = ?';
      queryParams.push(userEmail);
    }

    const [rows] = await pool.promise().query(query, queryParams);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching pet owners:', error);
    res.status(500).json({ message: 'Error fetching pet owners' });
  }
});

app.get('/postsa', async (req, res) => {
    try {
        // SQL query สำหรับดึงข้อมูลจากตาราง posts
        const query = 'SELECT name, age, gender, adopt, phone, price, image_path FROM posts';
        
        // ใช้ pool.promise().query แทน pool.execute เพื่อให้สามารถทำงานกับ Promise ได้
        const [rows] = await pool.promise().query(query);

        if (rows.length > 0) {
            res.json(rows); // ส่งข้อมูลเป็น JSON
        } else {
            res.status(404).send('No posts found');
        }
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
    }
});

app.get('/comments/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    const [rows] = await pool.promise().query('SELECT * FROM comments WHERE postId = ?', [postId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// 🔹 API เพิ่มความคิดเห็น
// 🔹 API เพิ่มความคิดเห็น
app.post('/comments', async (req, res) => {
  const { postId, username, comment } = req.body;

  if (!postId || !username || !comment) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.promise().query(
      "INSERT INTO comments (postId, username, comment) VALUES (?, ?, ?)",
      [postId, username, comment]
    );

    res.status(201).json({ message: "Comment added successfully", commentId: result.insertId });
  } catch (error) {
    console.error("Error inserting comment:", error);
    res.status(500).json({ error: "Database error" });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
