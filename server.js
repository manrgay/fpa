const express = require('express');
const mysql = require('mysql2/promise'); // ใช้ mysql2/promise แทน mariadb
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

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(400).send({ message: 'User not found' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ token });
  } catch (err) {
    console.error('Error logging in:', err);
    return res.status(500).send({ message: 'Server error' });
  }
});

// ฟังก์ชันสำหรับการตรวจสอบ JWT Token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

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
    const [rows] = await pool.query('SELECT email, first_name FROM users WHERE id = ?', [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API สำหรับการสมัครสมาชิก
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, gender, subscribe } = req.body;

  try {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (first_name, last_name, email, password, phone_number, gender, subscribe) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await pool.query(query, [firstName, lastName, email, hashedPassword, phoneNumber, gender, subscribe]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error registering user' });
  }
});

// API สำหรับการส่งฟอร์ม
app.post('/submit-form', async (req, res) => {
  const { name, petName, age, gender, category, phone, email, pickupDate } = req.body;

  if (!name || !petName || !age || !gender || !category || !phone || !email || !pickupDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM pet_owner WHERE email = ?', [email]);
    if (rows[0].count > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const query = 'INSERT INTO pet_owner (name, pet_name, age_group, gender, category, phone, email, pick_up_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [name, petName, age, gender, category, phone, email, pickupDate];

    await pool.query(query, values);

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// API สำหรับการโพสต์ข้อมูล
app.post('/posts', upload.single('image'), async (req, res) => {
  const { name, age, gender, adopt, phone, price } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const [rows] = await pool.query(
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

    const [rows] = await pool.query(query, queryParams);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching pet owners:', error);
    res.status(500).json({ message: 'Error fetching pet owners' });
  }
});

// API สำหรับดึงข้อมูลโพสต์
app.get('/postsa', async (req, res) => {
    try {
        const query = 'SELECT name, age, gender, adopt, phone, price, image_path FROM posts';
        const [rows] = await pool.query(query);

        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).send('No posts found');
        }
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
    }
});

// API สำหรับดึงความคิดเห็น
app.get('/comments', async (req, res) => {
  try {
    const [comments] = await pool.query(
      'SELECT id, name, comment, created_at FROM comments ORDER BY created_at DESC'
    );

    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API เพิ่มความคิดเห็น
// เพิ่มความคิดเห็น
// API เพิ่มความคิดเห็น
// เมื่อมีการเพิ่มความคิดเห็นใหม่
// เมื่อมีการเพิ่มความคิดเห็นใหม่
app.post('/comments', async (req, res) => {
  const { name, comment, post_id } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!name || !comment) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // หากไม่มี post_id หรือ post_id เป็น null
    const postId = post_id || null; // ถ้าไม่มี post_id จะตั้งค่าเป็น null

    // เพิ่มความคิดเห็นลงในฐานข้อมูล
    const query = 'INSERT INTO comments (post_id, name, comment) VALUES (?, ?, ?)';
    const values = [postId, name, comment];

    await pool.query(query, values);

    res.status(201).json({ message: "Comment added successfully" });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// API สำหรับเปลี่ยนรหัสผ่าน
app.post('/change-password', authenticateToken, async (req, res) => {
  const { new_password, current_password } = req.body;

  if (!new_password || !current_password) {
    return res.status(400).json({ message: 'Both current and new password are required' });
  }

  try {
    // ตรวจสอบว่า current_password ถูกต้องหรือไม่
    const [results] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // อัพเดต password ใหม่ในฐานข้อมูล
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// API สำหรับดึงข้อมูลบัญชีผู้ใช้
app.get('/account', authenticateToken, async (req, res) => {
  try {
    // ดึงข้อมูลจากตาราง users โดยใช้ ID ของผู้ใช้ที่มาจาก JWT
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, phone_number, gender, subscribe FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ส่งข้อมูลบัญชีผู้ใช้กลับ
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error fetching account details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
