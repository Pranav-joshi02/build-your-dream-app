# HospitalOS 🏥

> Real-Time Command Center & Hospital Operations Platform

HospitalOS is a high-fidelity, real-time operational command center and clinical coordination platform designed for modern healthcare facilities. Built with React 19, TypeScript, TanStack Start, and Tailwind CSS v4, it provides complete visibility into hospital capacity, active emergencies, pharmacy inventory, patient vitals, and AI-assisted clinical routing.

---

## 🌟 Key Features

- 🖥️ **Live Command Center Dashboard**: Unified monitor showcasing bed capacity (ICU vs. General), admission/discharge charts, live emergency queue, department load index, and real-time KPI metrics.
- 👥 **Clinical Patient Directory**: In-depth patient record profiles, medical condition tagging, interactive vitals timelines (Heart Rate, SpO2, Temperature), and diagnostic charts.
- 🩺 **Physician & Staff Roster**: Live shifts status tracking (Available, In Surgery, Off Shift), next appointment timelines, and patient load details.
- 📅 **Appointment Management & Scheduling**: Dynamic patient appointment check-in, real-time status updates (Waiting, In Progress, Scheduled), and doctor assignments.
- 🚑 **Emergency & Ambulance Coordination**: Real-time GPS mapping of inbound ambulance units, trauma bay allocation, patient severity index, and emergency status reports.
- 💊 **Pharmacy & Inventory Monitor**: Critical drug stock trackers (Adrenaline, Insulin, Blood units) with automated alerts (Low Stock, Critical Reorder) and pharmacy location maps.
- 🤖 **Gemini AI Command Assistant**: Integrated artificial intelligence assistant powered by Google Gemini for operational querying, clinical reports retrieval, and hands-free system navigation.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/latest/docs/framework/react/start/overview) (Server-side rendering, type-safe file routing, server functions)
- **State & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Interactions & Components**: Radix UI primitives, Lucide React, and Sonner notifications
- **Data Visualization**: Recharts for live vitals, department load, and admission charts
- **Geographic Mapping**: Leaflet & React-Leaflet for ambulance and pharmacy dispatch locations
- **Form Handling**: React Hook Form & Zod validation
- **AI Integrations**: Google Generative AI (Gemini API SDK)
- **Database Connection**: Neon Serverless Postgres Client

---

## 📂 Project Structure

```bash
├── src/
│   ├── components/         # Reusable UI widgets and layout modules
│   │   ├── forms/          # Admission, discharge, check-up, and report forms
│   │   ├── ui/             # Core Radix-based UI components (buttons, dialogs, progress-bars)
│   │   ├── app-shell.tsx   # Premium sidebar layout and main app skeleton
│   │   ├── chat-assistant.tsx # AI Chat overlay powered by Google Gemini
│   │   └── *-map.tsx       # Leaflet map implementations for pharmacies & ambulances
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility modules & simulated database datasets (hospital-data.ts)
│   ├── routes/             # TanStack file-based routing views
│   │   ├── __root.tsx      # Main layout shell, font imports & provider configuration
│   │   ├── index.tsx       # Hospital Command Center Dashboard
│   │   ├── patients.tsx    # Patient Directory & medical files
│   │   ├── doctors.tsx     # Doctors availability roster
│   │   ├── emergency.tsx   # ER and Ambulance dispatch
│   │   ├── pharmacy.tsx    # Pharmacy & inventory tracking
│   │   └── ...
│   ├── styles.css          # Tailwind CSS layer declarations & custom glassmorphism styles
│   └── main.tsx            # App initialization entry point
```

---

## 🚀 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) (v18+) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <this-repository-url>
   cd build-your-dream-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NEON_DATABASE_URL=your_neon_postgres_url_here
   OLLAMA_API_URL=http://localhost:11434 # Optional, if using local LLM models
   BREVO_API_KEY=your_email_sender_key_here # Optional
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000) (or the port specified by Vite/TanStack Start).

### Building for Production

Compile and bundle the application:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 💜 Built with Lovable

This project was built and is continuously synced with [Lovable](https://lovable.dev).

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d112a3e0-6bb5-4dbe-a374-d5c4fb668577).

- **Ship faster**: Describe what you want to build and Lovable handles the code.
- **Stay in sync**: Every change made in Lovable is committed straight to this repository.
- **Full ownership**: This code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
