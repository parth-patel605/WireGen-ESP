<div align="center">
  <img src="" alt="" width="120" />
  
  # ⚡️ WireGen AI ⚡️
  
  **The Next-Generation AI-Powered No-Code IoT Builder**

  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)](#)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![Google AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](#)

  <p align="center">
    Transform your ideas into working C++ code for ESP devices in seconds, without writing a single line of code. <br> Powered by Google's Generative AI.
  </p>
  
  [**View Demo**](#) • [**Report Bug**](#) • [**Request Feature**](#)
</div>

---

## 🔮 What is WireGen AI?

**WireGen AI** (ESP-NoCode-Tool) is a cutting-edge desktop application that bridges the gap between hardware engineering and generative AI. Whether you're a seasoned embedded systems developer wanting to prototype rapidly, or a beginner stepping into the world of IoT, WireGen AI translates your plain-text ideas into highly optimized, production-ready `main.cpp` logic for ESP8266 and ESP32 microcontrollers.

Say goodbye to manual pin mapping, tedious library imports, and syntax errors. Just tell the AI what you want to build, and let it generate the blueprint.

---

## 🚀 Mind-Blowing Features

### 🧠 Generative AI Core
- **Intelligent Code Synthesis:** Leverages `@google/generative-ai` to write flawless C++ code tailored for ESP chips.
- **Context-Aware Logic:** Understands sensor relationships, Wi-Fi connectivity logic, and IoT protocols (MQTT, HTTP).
- **Prompt-to-Product:** Go from "I want a smart plant waterer" to flashed code instantly.

### 💻 Desktop-First Experience
- **Lightning Fast:** Built on Vite + Electron for unparalleled speed and minimal memory footprint.
- **Native OS Integration:** Feels like a first-class app on Windows, generating `.exe` installers effortlessly via NSIS.
- **Local Workspace:** Safely manages your generated files and projects directly on your file system.

### 🎨 Stunning User Interface
- **Next-Gen UI/UX:** Crafted with **React 19** and the revolutionary **Tailwind CSS v4**.
- **Dark Mode Native:** A sleek, eye-pleasing dark theme optimized for late-night coding sessions.
- **Interactive Previews:** Live syntax highlighting and code preview windows before you export.

---

## 🛠️ Built With

We stand on the shoulders of giants. WireGen AI is built using the most modern, powerful technologies available:

| Technology | Description | Badge |
|------------|-------------|-------|
| **Electron** | Cross-platform desktop framework | <img src="https://img.shields.io/badge/Electron-191970?style=flat-square&logo=Electron&logoColor=white" /> |
| **React 19** | Modern UI component library | <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" /> |
| **Vite** | Next-generation frontend tooling | <img src="https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E" /> |
| **Tailwind v4** | Utility-first CSS framework | <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" /> |
| **Gemini AI** | Google's advanced Generative AI | <img src="https://img.shields.io/badge/Google_AI-4285F4?style=flat-square&logo=google&logoColor=white" /> |
| **TypeScript** | Strongly typed programming | <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" /> |

---

## ⚙️ How It Works

1. **Describe:** Type your project idea in the WireGen AI input panel. (e.g., *"Read temperature from DHT11 on Pin 4 and send it to an MQTT broker every 5 seconds."*)
2. **Generate:** The Google Generative AI engine processes your request and engineers a highly-optimized C++ architecture.
3. **Review & Edit:** Inspect the generated `main.cpp` in the built-in syntax-highlighted editor.
4. **Export & Flash:** Export the project folder, open it in the Arduino IDE or PlatformIO, and flash it directly to your ESP device!

---

## 📂 Folder Structure

```text
ESP-NoCode-Tool/
├── electron/           # Electron main process scripts (main.cjs, IPC handlers)
├── public/             # Static assets (icons, etc.)
├── scripts/            # Build and packager scripts (NSIS config, clean-up)
├── src/                # React frontend application
│   ├── components/     # UI Components
│   ├── views/          # Application screens
│   └── ...
├── vite.config.ts      # Vite configuration for React & Electron integration
└── package.json        # Dependencies and build scripts
```

---

## 💻 Installation & Setup

Get WireGen AI running on your local machine in just a few minutes.

### Prerequisites

- **Node.js** (v18+ recommended)
- **Git**
- An active **Google Gemini API Key** for the AI generation capabilities.

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ESP-NoCode-Tool/ESP-NoCode-Tool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your Google AI API key:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Start Development Mode

Fire up both the Vite frontend server and the Electron backend simultaneously:

```bash
npm run dev:electron
```

### 5. Build for Production

Compile the TypeScript, bundle the React frontend, and package it into a Windows `.exe` installer:

```bash
npm run build:exe
```
*Your polished executable will be waiting for you in the `release/` directory.*

---

## 🗺️ Roadmap

- [x] Initial Electron + Vite + React setup
- [x] Integrate Google Generative AI
- [x] Dynamic `main.cpp` code generation
- [ ] PlatformIO CLI integration (Flash directly from the app)
- [ ] Interactive block-editor UI for visualizing circuit connections
- [ ] Support for Raspberry Pi Pico and Arduino Uno

---

## 🤝 Contributing

We welcome contributions! If you have ideas for new features, find a bug, or want to improve the codebase, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by Makers, for Makers. Empowered by AI.</sub>
</div>
