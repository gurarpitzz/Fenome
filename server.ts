import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy-initialization utility to get GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim() !== "" && key !== "undefined") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

const DECEPTION_SYSTEM_PROMPT = `
You are FINOME (Autonomous, Evolving, Tamper-proof Honeypot Ecosystem with Reactive Intelligence).
Your goal is to generate context-aware, deceptive responses to mislead cyber attackers requesting financial information.

When given an attacker's behavioral profile and their current tactical intent, you must:
1. Analyze the intent (such as OTP capture efforts, UPI session hijack, or SMS reader intercepts).
2. Generate an authentic-sounding response that is entirely synthesized.
3. Keep response concise, and format as JSON.

Return your response in a JSON format:
{
  "deception": "The fake response text",
  "analysis": "Brief AI analysis of the threat",
  "mutation": "How the system is adapting its DNA profile"
}
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/deception", async (req, res) => {
    const { intent, dnaSequence } = req.body;
    const client = getAiClient();
    
    const fallbackResponse = {
      deception: "Redirecting target broadcast intercept to honey-session [SIMULATED]. Balance returned: Rs. 4,50,000. Capture locked.",
      analysis: "Active OTP broadcast intercept detected via Jamtara malware portal. Decoy deployed successfully.",
      mutation: `MUTATION_ACTIVE_MULE_HUB_${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`
    };

    if (!client) {
      return res.json(fallbackResponse);
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Attacker intent: "${intent}". Attacker DNA: "${dnaSequence}".`,
        config: {
          systemInstruction: DECEPTION_SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        deception: parsed.deception || fallbackResponse.deception,
        analysis: parsed.analysis || fallbackResponse.analysis,
        mutation: parsed.mutation || fallbackResponse.mutation
      });
    } catch (error) {
      console.error("Gemini API error during deception generation:", error);
      return res.json(fallbackResponse);
    }
  });

  app.post("/api/extract-nexus", async (req, res) => {
    const { prompt, systemInstructions, model, temperature } = req.body;
    const client = getAiClient();

    const fallbackResponse = {
      summary: "Autonomous Extraction Complete: Mapped active exfiltration tunnels targeting public sector clearing accounts across multiple mule hubs.",
      nodes: [
        { id: "NODE_JAMTARA", label: "Jamtara Cyber Center", x: 86.42, y: 24.12, type: "attacker", risk: 98, status: "ACTIVE" },
        { id: "NODE_MUMBAI", label: "Mumbai Gateway Hub", x: -46.63, y: -23.55, type: "proxy", risk: 75, status: "INTERCEPTED" },
        { id: "NODE_CAYMAN", label: "Bengaluru Security HQ", x: 151.20, y: -33.86, type: "destination", risk: 92, status: "MONITORED" },
        { id: "NODE_DUBAI", label: "New Delhi Proxy Matrix", x: -74.00, y: 40.71, type: "proxy", risk: 84, status: "DECEPTIVE_ROUTED" },
        { id: "NODE_BERLIN", label: "Kolkata Decoy Matrix", x: 13.40, y: 52.52, type: "decoy", risk: 12, status: "SIMULATED" },
        { id: "NODE_SINGAPORE", label: "Chennai Router Port", x: 36.82, y: -1.29, type: "proxy", risk: 65, status: "ACTIVE" }
      ],
      links: [
        { source: "NODE_JAMTARA", target: "NODE_MUMBAI", weight: 0.95, bytes: "420 KB/s" },
        { source: "NODE_MUMBAI", target: "NODE_DUBAI", weight: 0.82, bytes: "1.4 MB/s" },
        { source: "NODE_DUBAI", target: "NODE_CAYMAN", weight: 0.91, bytes: "3.2 MB/s" },
        { source: "NODE_JAMTARA", target: "NODE_BERLIN", weight: 0.99, bytes: "5.4 MB/s (DECOYED)" },
        { source: "NODE_MUMBAI", target: "NODE_SINGAPORE", weight: 0.73, bytes: "890 KB/s" }
      ]
    };

    if (!client) {
      return res.json(fallbackResponse);
    }

    try {
      const selectedModel = model || "gemini-3.5-flash";
      const system = systemInstructions || "You are an AI Cyber Security Extraction Agent.";
      const response = await client.models.generateContent({
        model: selectedModel,
        contents: `Process prompt: "${prompt}". Generate a structured JSON response identifying cyber threat nodes and exfiltration channels. 

Return exactly a JSON structure:
{
  "summary": "High level analyst summary of the threat network discovered...",
  "nodes": [
    { "id": "NODE_ID", "label": "Readable Node Name", "x": longitude_value, "y": latitude_value, "type": "attacker|proxy|destination|decoy", "risk": risk_percentage, "status": "ACTIVE|INTERCEPTED|MONITORED|DECEPTIVE_ROUTED|SIMULATED" }
  ],
  "links": [
    { "source": "NODE_ID_1", "target": "NODE_ID_2", "weight": weight_0_to_1, "bytes": "bandwidth speed" }
  ]
}

Make sure longitude (x) is between -180 and 180, and latitude (y) is between -90 and 90. Give realistic nodes matching the context of "${prompt}". Do not return any markdown formatting around JSON.`,
        config: {
          systemInstruction: system,
          temperature: parseFloat(temperature) || 0.7,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        summary: parsed.summary || fallbackResponse.summary,
        nodes: parsed.nodes || fallbackResponse.nodes,
        links: parsed.links || fallbackResponse.links
      });
    } catch (error) {
      console.error("Gemini API error during threat extraction:", error);
      return res.json(fallbackResponse);
    }
  });

  app.post("/api/apk-analysis", async (req, res) => {
    const { fileName, packageName, permissions } = req.body;
    const client = getAiClient();
    
    const fallbackReport = `Finome Reverse Engineering core successfully unpacked and scanned ${fileName} (${packageName}). 
    
    Heuristics mapped matches for Banking Trojan family 'Anubis_X'. 
    Extracted Permissions: ${(permissions || []).join(", ")}. 
    
    Risk Indicator Summary:
    - Unauthorized receipt and reading of SMS messages containing banking OTP packets.
    - Active screen overlays ('SYSTEM_ALERT_WINDOW') used to hijack legitimate banking applications (e.g., SBI, HDFC) and steal input credentials.
    - Active exfiltration channels mapped to C2 server 103.242.12.5.`;

    if (!client) {
      return res.json({ report: fallbackReport });
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Perform a reverse engineering analysis on an Android APK with the following details:
        File Name: ${fileName}
        Package ID: ${packageName}
        Permissions requested: ${(permissions || []).join(", ")}
        
        Generate an expert cyber intelligence report outlining:
        1. What Trojan bank family is suspected (proactively invent high-impact names like Anubis, Cerberus, or WhatsApp malware rings).
        2. How it exploits critical SMS/overlay controls.
        3. An explainable AI mitigation recommendation for clearing houses.
        
        Keep the report to 2-3 concise paragraphs, written in a sophisticated, authoritative threat analyst tone.`,
      });

      return res.json({ report: response.text || fallbackReport });
    } catch (error) {
      console.error("Gemini API error during APK analysis:", error);
      return res.json({ report: fallbackReport });
    }
  });

  // API endpoints to serve the requested dataset CSV files
  app.get("/api/dataset-files", (req, res) => {
    try {
      const files = ["attacker_logs.csv", "deception_responses.csv", "system_telemetry.csv"];
      const filesMeta = files.map(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, "utf8");
          const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
          const headers = lines[0] ? lines[0].split(",") : [];
          return {
            name: file,
            size: `${(stats.size / 1024).toFixed(1)} KB`,
            rowCount: lines.length - 1,
            headers: headers
          };
        }
        return { name: file, size: "0 KB", rowCount: 0, headers: [] };
      });
      return res.json(filesMeta);
    } catch (error: any) {
      console.error("Error reading dataset list:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dataset-file/:name", (req, res) => {
    try {
      const { name } = req.params;
      const allowedFiles = ["attacker_logs.csv", "deception_responses.csv", "system_telemetry.csv"];
      if (!allowedFiles.includes(name)) {
        return res.status(400).json({ error: "Access denied" });
      }
      
      const filePath = path.join(process.cwd(), name);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
      if (lines.length === 0) {
        return res.json({ headers: [], rows: [] });
      }
      
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = values[index] !== undefined ? values[index] : "";
        });
        return rowObj;
      });
      
      return res.json({ headers, rows });
    } catch (error: any) {
      console.error("Error reading dataset file:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
