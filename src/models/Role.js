import pool from '../config/database.js';

class Role {
  static async getAll() {
    const query = 'SELECT * FROM roles';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Role;