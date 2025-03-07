import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN_GENERAL, RESPONSABLE_HEBERGEMENT, RECEPTIONNISTE, PROPRIETAIRE, MAINTENANCE, CLIENT, CHAUFFEUR, COMPTABILITE]
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (full_name, email, password, role, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const values = [fullName, email, hashedPassword, role, phoneNumber];
    const result = await pool.query(query, values);
    res.status(201).json({ message: "Utilisateur créé avec succès", userId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // Code d'erreur PostgreSQL pour violation de contrainte unique
      res.status(400).json({ message: "Cet email est déjà utilisé" });
    } else {
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecter un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Connexion réussie
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       400:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: Email ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERROR
 *                 message:
 *                   type: string
 *                   example: Erreur lors de la connexion
 */
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      const user = result.rows[0];
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
          status: "OK",
          message: "Connexion réussie",
          data: { token }
        });
      } else {
        res.status(400).json({
          status: "ERROR",
          message: "Email ou mot de passe incorrect"
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la connexion"
      });
    }
  });
export default router;