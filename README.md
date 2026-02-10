# annsmuiza-mobile

Admin Mobile App

Cross-platform admin mobile application for managing bookings using an existing Next.js + PostgreSQL (Prisma) backend.

⸻

📌 Project Goal

Build a mobile admin app that allows administrators to manage bookings from their phone, fully integrated with the existing web system.

The app is admin-only and focuses on speed, clarity, and reliability.

⸻

🧱 Tech Stack
	•	React Native + Expo
	•	Postgress/SQL + docker + PrismaDB
	•	Next.js REST API (existing backend)
	•	JWT Authentication (access + refresh tokens)
	•	React Query – server state management
	•	React Hook Form – form handling
	

⸻

✨ Core Features (MVP)

Authentication
	•	Admin login
	•	Admin logout

Bookings
	•	Booking list
	•	Booking filters (status, date)
	•	Booking detail view
	•	Booking actions:
	•	confirm
	•	cancel
	•	delete

⸻

🔌 API Strategy

The mobile app communicates with a dedicated admin API layer:
	•	POST /api/admin/auth
	•	GET /api/admin/bookings

API Rules
	•	Pagination for list endpoints
	•	Consistent date formatting
	•	Role-based access (admin only)
	•	Shared business logic with web admin panel

⸻

🗂 App Structure

Modules
	•	Auth
	•	Bookings

Navigation
	•	Tab navigation for main sections
	•	Stack navigation for detail and edit screens

⸻

🎯 UX Priorities
	•	Fast booking filtering
	•	One-tap confirm / cancel actions
	•	Clear loading and empty states
	•	Simple, admin-focused UI

⸻

🚀 V1 Enhancements
	•	Push notifications for new bookings
	•	Audit log (track admin actions)
	•	Basic analytics (booking counts, status overview)

⸻

🛠 Development Phases

Phase 1 – Foundation
	•	Initialize Expo project
	•	Implement authentication
	•	Define API contracts

Phase 2 – Bookings MVP
	•	Booking list and detail screens
	•	Booking status actions

Phase 3 – Notifications & Hardening
	•	Push notifications
	•	Security and performance improvements

⸻

📚 Notes
	•	The app reuses the existing backend and database
	•	No separate backend is required
	•	Expo free tier is sufficient for this project

