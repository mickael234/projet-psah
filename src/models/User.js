import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class User {
  static async create(username, password, roleId) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [username, hashedPassword, roleId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default User;