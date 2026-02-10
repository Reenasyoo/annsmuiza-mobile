# annsmuiza-mobile

1. Goal
Create a cross-platform mobile admin app that works with the existing Next.js + PostgreSQL (Prisma) system.
The app will be used only by admins to manage bookings.

2. Tech Stack
Use the following technologies:
React Native + Expo – to build the mobile app for Android and iOS


REST API – reuse existing Next.js API routes


JWT authentication – short-lived access token + refresh token


React Query – for fetching and updating server data


React Hook Form – for handling forms (login, filters)



3. Core Features (MVP)
Authentication
Admin login


Admin logout


Bookings
Booking list


Filters (status, date)


Booking detail screen


Actions:


confirm booking


cancel booking


delete booking



4. API Strategy
Create a small admin-only API layer in the Next.js backend:
/api/admin/auth


/api/admin/bookings


API rules:
Use pagination for lists


Use consistent date format


Protect routes by role (admin only)


Reuse the same business logic as the web admin panel



5. App Structure
Main sections:
Auth


Bookings


Navigation:
Tab navigation for main sections


Stack navigation for detail and edit screens



6. UX Priorities
Fast and simple booking filters


One-tap confirm / cancel buttons


Clear loading and empty states


Simple, readable layouts (admin-focused)



7. V1 Enhancements (after MVP)
Push notifications for new bookings


Audit log (track changes)


Basic analytics (booking count, status)



8. Development Phases
Foundation


Setup Expo project


Implement authentication


Define API contracts


Bookings MVP


Booking list and detail views


Booking actions (confirm, cancel, delete)


Notifications & Hardening


Push notifications


Security and performance improvements





