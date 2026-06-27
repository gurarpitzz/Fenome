# FENOME

### Autonomous, Evolving, Tamper-Proof Honeypot Ecosystem with Reactive Intelligence
*Misleading and neutralizing cyber threat vectors targeting financial environments using temporal twins and real-time generative honeypots.*

---

## Hackathon Affiliation

This project was curated and built specifically for the **SBI @ Global Fintech Fest Hackathon 2026**. FENOME showcases next-generation security and proactive threat mitigation strategies engineered to protect high-volume banking systems and transactional operations.

### Team Members
*   **Gurarpit Singh**
*   **Mehardeep Singh**
*   **Saksham Bhutani**
*   **Anurag Arora**

---

## Overview

FENOME is a state-of-the-art cyber intelligence platform designed to protect financial institutions and clearing houses by deploying reactive, autonomous honeypot twins. By utilizing advanced LLM reasoning (via Google Gemini) and deep graph neural networks, FENOME identifies, intercepts, and misleads malicious activities, particularly targeting mobile banking Trojans (such as WhatsApp/UPI overlay hijacking and Jamtara OTP broadcast intercepts).

Rather than simply blocking attacks, FENOME engages attackers in high-fidelity simulated environments, feeding them synthetic credentials, and mapping their command-and-control (C2) network topology in real-time.

---

## Key Features

*   **Deception Genome Core**: A rotating visualization engine mapping the digital DNA profile of mutations in the honeypot structure, dynamically updating to prevent signature detection.
*   **Finome Constellation**: A cognitive coordinate graph tracing attacker intents, spending behaviors, and transaction routing patterns.
*   **Finome Nexus**: A geographic network and graph visualization mapping real-time data exfiltration tunnels, decoy routing ports, and active proxy servers.
*   **Twin Syndicate (Apk Lab)**: An interactive reverse-engineering sandbox where security teams can upload malicious APKs to unpack, scan permissions, identify banking Trojan families (like Anubis, Cerberus, and WhatsApp/UPI interceptors), and generate expert threat reports.
*   **Deception Oracle**: A heuristic forecasting engine illustrating speculative decision branching in honeypot scenarios.
*   **Telemetry Hub**: Interactive dataset explorer that exposes live database logs (attacker_logs.csv, deception_responses.csv, and system_telemetry.csv).
*   **Risk Entropy Chart**: A real-time monitor evaluating multi-factor risk, threat density rates, and system entropy.

---

## Technology Stack

*   **Frontend**: React (v19) + TypeScript, built with Vite.
*   **Backend**: Node.js & Express API server.
*   **AI Engine**: Powered by Google Gemini (@google/genai) for context-aware deception payload generation and reverse-engineering APK report analysis.
*   **Visualization**: Motion (Framer Motion) for premium cinematic animations, Lucide icons, and HSL custom dark-mode styling.

---

## Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   NPM or Yarn
*   A Google Gemini API key (retrieve from Google AI Studio)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/gurarpitzz/Fenome.git
   cd Fenome
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory (using `.env.example` as a reference) and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the application in development mode:
   ```bash
   npm run dev
   ```
   The local development server will start at `http://localhost:3000`.

### Building for Production
To bundle the frontend assets and compile the Express server into a standalone production package:
```bash
npm run build
npm start
```

---

## How It Works (The AI Deception Engine)

When an attacker attempts to intercept financial events (such as OTP requests or balance inquiries), FENOME's middleware forwards the tactical intent to the Gemini model powered by the gemini-3.5-flash model. 

1. **Behavioral Analysis**: The model digests the attacker's intent and active DNA sequence.
2. **Deceptive Synthesis**: The model synthesizes authentic-sounding decoy transactions (e.g., simulated banking balances and SMS broadcast alerts).
3. **Network Mapping**: If a suspicious APK is uploaded, the AI unpacks the requested permissions (e.g., READ_SMS, SYSTEM_ALERT_WINDOW) and builds a detailed mitigation advisory for clearing houses.
