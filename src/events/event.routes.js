'use strict'

import { Router } from "express"
import { 
    createEvent, 
    registerToEvent, 
    cancelRegistration,
    getAttendeesList 
} from "./event.controller.js"
import { validateJWT } from "../../middlewares/validate-JWT.js"
import { requireRole } from "../../middlewares/validate-role.js"

const api = Router()

// SR-190: Solo un Admin puede crear el evento
api.post("/", [validateJWT, requireRole('ADMIN')], createEvent)

// SR-204: Cualquier usuario logueado puede inscribirse
api.post("/register/:id", [validateJWT], registerToEvent)

// SR-207: El usuario puede cancelar su propia inscripción
api.delete("/cancel/:id", [validateJWT], cancelRegistration)

// SR-208: El Admin puede ver la lista de asistentes
api.get("/attendees/:id", [validateJWT, requireRole('ADMIN')], getAttendeesList)

export default api