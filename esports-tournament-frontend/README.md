# 🎮 Esports Tournament Hub - Frontend

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443322?style=for-the-badge&logo=zustand&logoColor=white)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

A professional, high-performance web interface for managing esports tournaments, tracking live results, and generating professional points tables. Built with a futuristic "Cyberpunk" aesthetic and real-time data synchronization.

## ✨ Key Features

-   **🏆 Tournament Management:** Create and manage multi-stage tournaments with ease.
-   **📊 Live Leaderboards:** Real-time points table updates powered by Socket.io.
-   **🖱️ Smart Data Parsing:** Bulk upload match results from CSV or text-based formats.
-   **🤝 Team & Roster Management:** Comprehensive squad tracking and player statistics.
-   **📈 Visual Analytics:** Performance insights using Recharts.
-   **🎨 Premium UI/UX:** Dark-themed, responsive design with smooth animations.
-   **🔐 Secure Auth:** Integrated Google OAuth and organization-based access control.
-   **📄 Format Export:** Generate and download PDF/Image versions of points tables for social media.

## 🚀 Tech Stack

-   **Core:** React 18, Vite
-   **Styling:** Tailwind CSS, Framer Motion (Animations)
-   **State Management:** Zustand
-   **Routing:** React Router v6
-   **Forms:** React Hook Form
-   **Real-time:** Socket.io Client
-   **Data Viz:** Recharts
-   **Icons:** Lucide React

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/digeesh038/esports-table-maker-frontend.git
    cd esports-table-maker-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    VITE_SOCKET_URL=http://localhost:5000
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```text
src/
├── api/            # API service layers (Axios config, endpoints)
├── components/     # Reusable UI components (Atomic design)
│   ├── auth/       # Authentication specific components
│   ├── common/     # Generic UI elements (Buttons, Modals, etc.)
│   ├── leaderboard/# Ranking & Table UI
│   └── ...         # Feature-specific components
├── contexts/       # React Context providers (Auth, Socket)
├── hooks/          # Custom hooks for business logic
├── layouts/        # Page layout wrappers
├── pages/          # View components (Routes)
├── store/          # Global state management (Zustand)
├── utils/          # Helpers, constants, and validators
└── App.jsx         # Root component & Routing
```

## 📸 Screenshots

*(Add your screenshots here to show off the premium UI)*

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for the Esports Community.        