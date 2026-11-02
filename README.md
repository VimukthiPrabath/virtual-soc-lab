# 🛡️ Virtual SOC Analyst Workbench & Investigation Platform

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Cybersecurity](https://img.shields.io/badge/Role-SOC_Tier_1_Analyst-red.svg)](https://mitre.org)

An interactive, modular **Security Operations Center (SOC) Workbench** designed for Tier 1 analysts and incident responders to ingest, inspect, defang, and triage suspicious security artifacts in real time.

---

## 📌 Problem Statement & Motivation
In enterprise environments, Tier 1 SOC analysts triage dozens of user-reported phishing alerts and suspicious network indicators daily. Manual analysis of raw RFC 822 email headers and dangerous hyperlinks is time-consuming and risks accidental execution. 

This platform provides an automated triage engine that parses headers, validates email authentication protocols (SPF/DKIM/DMARC), extracts and defangs IOCs, and calculates an incident risk score.

---

## 🚀 Key Modules & Capabilities

### Module 1: Phishing Email Analyzer (Current)
* **Domain Spoofing Detection**: Automatically checks for mismatches between the user-facing display `From:` address and the SMTP envelope `Return-Path:`.
* **Authentication Validation**:
  * **SPF (Sender Policy Framework)** verification against the originating mail relay.
  * **DKIM (DomainKeys Identified Mail)** signature check.
  * **DMARC (Domain-based Message Authentication, Reporting, and Conformance)** enforcement evaluation.
* **Originating IP Extraction & Safe Defanging**: Extracts the true origin relay IP from `Received` hops and automatically formats it safely (e.g., `185.220.101[.]5`) for incident reports.
* **Automated IOC Extraction & Defanging**: Parses embedded hyperlinks in the body and transforms them to harmless notations (e.g., `hxxps://malicious[.]com`).
* **Heuristic Risk Engine**: Computes a dynamic risk score (0-100) and categorizes incidents as `CLEAN`, `SUSPICIOUS`, or `MALICIOUS (PHISHING)`.

---

## 🗺️ Project Roadmap
- [x] **Module 1**: Phishing Email Analyzer & RFC 822 Header Inspector
- [ ] **Module 2**: Threat Intelligence & OSINT IOC Lookup (VirusTotal & AbuseIPDB APIs)
- [ ] **Module 3**: Mini SIEM Log Investigator (Windows Event IDs 4625, 4624 & Sysmon Event 1 Brute Force scenarios)
- [ ] **Module 4**: Incident Ticket & Executive Summary Generator (SANS PICERL framework)

---

## 🛠️ Architecture & Tech Stack

```text
virtual_soc_lab/
├── backend/                  # Python FastAPI Engine
│   ├── main.py               # REST API Endpoints & CORS
│   ├── phish_analyzer.py     # Email parsing, regex & security heuristics
│   └── requirements.txt      # Backend dependencies
├── frontend/                 # React + Vite Dark Theme Dashboard
│   ├── src/
│   │   ├── App.jsx           # SOC Analyst UI & State
│   │   ├── index.css         # Dark theme styling
│   │   └── main.jsx
│   └── package.json
└── README.md
```

* **Frontend**: React 18, Vite, Lucide Icons, Modern Cyberpunk SOC Dark UI.
* **Backend**: Python 3, FastAPI, Pydantic, Native Email/Regex Parsers.

---

## ⚡ Quick Start / Local Setup

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ & npm

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000`.  
Interactive Swagger documentation available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 👤 Author
**Vimukthi Prabhath**
* Aspiring Cybersecurity & SOC Professional
* TryHackMe SOC Path Learner & Security Researcher
