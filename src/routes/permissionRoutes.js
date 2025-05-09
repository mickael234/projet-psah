import express from "express"
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  checkUserPermission,
  getUserPermissions,
} from "../controllers/permissionController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()

// Assurez-vous que authenticateJWT est appliqué à toutes les routes
router.get("/", authenticateJWT, getAllPermissions)
router.post("/", authenticateJWT, createPermission)
router.put("/:id", authenticateJWT, updatePermission)
router.delete("/:id", authenticateJWT, deletePermission)
router.get("/roles", authenticateJWT, getAllRoles)
router.post("/roles", authenticateJWT, createRole)
router.get("/roles/:id", authenticateJWT, getRoleById)
router.put("/roles/:id", authenticateJWT, updateRole)
router.delete("/roles/:id", authenticateJWT, deleteRole)
router.post("/assign-role", authenticateJWT, assignRoleToUser)
router.get("/check/:userId/:permissionCode", authenticateJWT, checkUserPermission)
router.get("/user/:userId", authenticateJWT, getUserPermissions)

export default router