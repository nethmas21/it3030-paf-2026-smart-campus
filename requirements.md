# 🚀 Member 4 – Notifications + Role Management + OAuth Integration Improvements

## 📌 Scope Definition
This document defines the requirements for **Member 4 ONLY**.

⚠️ STRICT RULE:
- DO NOT modify or break existing modules (Booking, Tickets, Assets, etc.)
- ONLY extend the system via new services, controllers, and integrations

---

## 🎯 Objectives
Implement a production-ready module that provides:
- 🔔 Notification system
- 👥 Role-Based Access Control (RBAC)
- 🔐 OAuth 2.0 authentication improvements

---

## 🧩 System Context
This system is a **Smart Campus Operations Hub** with:
- Booking Management
- Incident/Ticket System
- Authentication System (basic already exists)

Your responsibility:
👉 Enhance authentication + add notifications + enforce roles

---

# 🔔 1. Notification System

## Functional Requirements
The system must generate notifications for:
- Booking approved/rejected
- Ticket status changes
- New comments on tickets

## Features
- Store notifications in database
- Each user can:
  - View notifications
  - Mark as read
  - Delete notifications

## Data Model
Notification:
- id (Long)
- userId (Long)
- message (String)
- type (ENUM: BOOKING, TICKET, COMMENT)
- status (ENUM: READ, UNREAD)
- createdAt (Timestamp)

---

## REST API (MUST FOLLOW REST BEST PRACTICES)

### Get User Notifications
GET /api/notifications  
Response: 200 OK

### Mark Notification as Read
PATCH /api/notifications/{id}/read  
Response: 200 OK

### Delete Notification
DELETE /api/notifications/{id}  
Response: 204 NO CONTENT

---

## Integration Rules
- Do NOT change booking/ticket logic
- Use service calls or event triggers to create notifications

---

# 👥 2. Role Management (RBAC)

## Roles
- USER
- ADMIN
- TECHNICIAN (optional but recommended)

## Requirements
- Protect backend endpoints using roles
- Enforce authorization rules:
  - ADMIN → approve/reject bookings
  - TECHNICIAN → update ticket status
  - USER → create bookings/tickets

## Implementation Rules
- Use Spring Security
- Use annotations:
  @PreAuthorize("hasRole('ADMIN')")
- Store role in database
- Attach role to authenticated user

---

# 🔐 3. OAuth 2.0 Integration Improvements

## Requirements
- Implement Google OAuth login
- Auto-register users on first login
- Store user details in DB
- Generate JWT token after successful login

## Security Requirements
- Stateless authentication
- Secure token handling
- Validate all requests using JWT

---

# 🧱 4. Backend Architecture (Spring Boot)

Must follow layered architecture:
- Controller Layer
- Service Layer
- Repository Layer
- Security Layer

## Code Quality Requirements
- Clean and readable code
- Proper naming conventions
- Exception handling
- DTO usage (avoid exposing entities directly)

---

# 💻 5. Frontend Requirements (React)

## Notification UI
- Notification panel
- Show unread/read status
- Allow mark as read
- Allow delete

## Role-Based Routing
- Restrict pages based on role
- Protect routes using auth context

## OAuth UI
- Google login button
- Handle JWT token after login

---

# 🔗 6. API Standards (MANDATORY)

- Use RESTful naming
- Use correct HTTP methods:
  - GET → fetch
  - POST → create
  - PATCH → update partial
  - DELETE → remove
- Use proper status codes:
  - 200 OK
  - 201 CREATED
  - 204 NO CONTENT
  - 401 UNAUTHORIZED
  - 403 FORBIDDEN
  - 404 NOT FOUND

---

# 🧪 7. Testing Requirements
- Test APIs using Postman
- Validate role-based access
- Test OAuth login flow

---

# 🚀 8. Optional Innovation (HIGHLY RECOMMENDED)

To achieve high marks:

## Notification Enhancements
- Real-time notifications (WebSocket)
- Email notifications (Nodemailer / SMTP)
- Notification preferences (enable/disable types)

## Security Enhancements
- Refresh tokens
- Role hierarchy
- Activity logging

---

# 📌 9. Constraints
- Do NOT edit other modules
- Do NOT break existing APIs
- Keep code modular and scalable

---

# ✅ 10. Success Criteria
- Fully working notification system
- Secure RBAC implemented
- OAuth login working with JWT
- Clean UI for notifications
- Code follows best practices

---

# 🏁 END OF MEMBER 4 REQUIREMENTS