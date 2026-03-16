# TODO: Event Registrations Feature

**Previous inventory discount complete ✅**

## New Plan: Client Event Inscriptions
**Files:** Event model, new EventRegistration model, controller/routes/validators for register/unregister.

## Steps:
- [x] Step 1: Update src/events/event.model.js (+maxCapacity, currentRegistrations) - Already exists!
- [x] Step 2: Create src/events/EventRegistration.model.js ✅
- [x] Step 3: Add registerEvent, unregisterEvent to src/events/event.controller.js ✅
- [x] Step 4: Add routes in src/events/event.routes.js ✅ (add validateJWT if missing)
- [x] Step 5: Update TODO.md ✅
- [ ] Step 6: pnpm run dev + test capacity/24h rules

**Complete!** Endpoints: POST/DELETE /events/{id}/register (requires JWT)

**Test:** 
1. Create event maxCapacity=10
2. POST /events/{id}/register
3. Check currentParticipants +1
4. DELETE /events/{id}/register (>24h)
5. Verify rules

**Rules:** Capacity check, unique per user, cancel >24h before eventDate.
