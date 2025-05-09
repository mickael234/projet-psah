// src/docs/index.js
import authRouteDoc from "./swagger.js"
import profileRouteDoc from "./profileRouteDoc.js"
import hebergementRouteDoc from "./hebergementRouteDoc.js"
import reservationRouteDoc from "./reservationRouteDoc.js"
import paiementRouteDoc from "./paiementRouteDoc.js"
import statusRouteDoc from "./statusRouteDoc.js"
import permissionRouteDoc from "./permissionRouteDoc.js"
import favorisRouteDoc from "./favorisRouteDoc.js"
import serviceRouteDoc from "./serviceRouteDoc.js"
import nettoyageRouteDoc from "./nettoyageRouteDoc.js"
import maintenanceRouteDoc from "./maintenanceRouteDoc.js"
import planningRouteDoc from "./planningRouteDoc.js"
import fournitureRouteDoc from "./fournitureRouteDoc.js"

const swaggerDocs = {
  ...authRouteDoc,
  ...profileRouteDoc,
  ...hebergementRouteDoc,
  ...reservationRouteDoc,
  ...paiementRouteDoc,
  ...statusRouteDoc,
  ...permissionRouteDoc,
  ...favorisRouteDoc,
  ...serviceRouteDoc,
  ...nettoyageRouteDoc,
  ...maintenanceRouteDoc,
  ...planningRouteDoc,
  ...fournitureRouteDoc,
}

export default swaggerDocs

