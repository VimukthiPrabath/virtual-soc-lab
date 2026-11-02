import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  Terminal, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Globe, 
  FileText,
  Activity,
  Layers
} from 'lucide-react';

// Automatically detect local vs Vercel deployed environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:8000'
    : '');

export default function App() {
  const [activeTab, setActiveTab] = useState('phishing');
  const [rawEmail, setRawEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [copied, setCopied] = useState(false);

  // Check Backend Health on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') setBackendStatus('online');
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

const FALLBACK_SAMPLE = `Delivered-To: victim.user@company.com
Received: by 2002:a05:6e02:1889 with SMTP id x9csp3211512ilv;
        Mon, 2 Nov 2026 08:14:22 -0700 (PDT)
Return-Path: <bounce-daemon@evil-attacker-servers.ru>
Received: from mail.evil-attacker-servers.ru (mail.evil-attacker-servers.ru. [185.220.101.5])
        by mx.google.com with ESMTP id p12si2871923plb.124
        for <victim.user@company.com>;
        Mon, 2 Nov 2026 08:14:21 -0700 (PDT)
Received-SPF: fail (google.com: domain of support@paypal.com does not designate 185.220.101.5 as permitted sender) client-ip=185.220.101.5;
Authentication-Results: mx.google.com;
       spf=fail (google.com: domain of support@paypal.com does not designate 185.220.101.5 as permitted sender) smtp.mailfrom=bounce-daemon@evil-attacker-servers.ru;
       dkim=fail header.i=@paypal.com;
       dmarc=fail (p=REJECT sp=REJECT dis=NONE) header.from=paypal.com
From: "PayPal Security Team" <support@paypal.com>
To: victim.user@company.com
Subject: URGENT: Your PayPal Account Has Been Suspended - Action Required
Date: Mon, 2 Nov 2026 15:14:15 +0000

Dear Valued Customer,

We detected unauthorized login attempts to your PayPal account from an unrecognized IP location. For your security, your account has been temporarily locked.

Please verify your identity immediately within 24 hours to avoid permanent suspension:
https://paypal-account-verification-login.com/secure-portal/login.php

If you do not take action, your access will be terminated.

Security Team
PayPal Inc.`;

  // Load realistic sample phishing email
  const loadSampleEmail = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sample-email`);
      if (res.ok) {
        const data = await res.json();
        setRawEmail(data.sample);
        return;
      }
    } catch (e) {
      // ignore, fallback
    }
    setRawEmail(FALLBACK_SAMPLE);
  };

  // Run Phishing Analysis
  const handleAnalyze = async () => {
    if (!rawEmail.trim()) {
      alert("Please paste an email header or load a sample!");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze-phish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_email: rawEmail }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Analysis failed. Is backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Bar */}
      <header style={{ 
        borderBottom: '1px solid #1f2937', 
        background: '#0d1322', 
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #0284c7, #3b82f6)', 
            padding: '10px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)'
          }}>
            <Shield size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              Virtual SOC Analyst Workbench
            </h1>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              Interactive Tier 1 Security Operations & Threat Investigation Platform
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            background: backendStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${backendStatus === 'online' ? '#10b981' : '#ef4444'}`,
            color: backendStatus === 'online' ? '#34d399' : '#f87171'
          }}>
            <Activity size={15} />
            <span>SOC Engine: {backendStatus.toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* Module Tabs Header */}
      <div style={{ 
        background: '#111827', 
        borderBottom: '1px solid #1f2937', 
        padding: '0 32px',
        display: 'flex',
        gap: '24px'
      }}>
        <button 
          onClick={() => setActiveTab('phishing')}
          style={{
            padding: '14px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'phishing' ? '3px solid #38bdf8' : '3px solid transparent',
            color: activeTab === 'phishing' ? '#38bdf8' : '#9ca3af',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <Mail size={16} /> Module 1: Phishing Analyzer
        </button>

        <button 
          onClick={() => setActiveTab('threat-intel')}
          style={{
            padding: '14px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'threat-intel' ? '3px solid #38bdf8' : '3px solid transparent',
            color: activeTab === 'threat-intel' ? '#38bdf8' : '#6b7280',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <Globe size={16} /> Module 2: Threat Intel & IOC Scanner
          <span style={{ fontSize: '10px', background: '#374151', color: '#d1d5db', padding: '2px 6px', borderRadius: '4px' }}>Coming Next</span>
        </button>

        <button 
          onClick={() => setActiveTab('log-triage')}
          style={{
            padding: '14px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'log-triage' ? '3px solid #38bdf8' : '3px solid transparent',
            color: activeTab === 'log-triage' ? '#38bdf8' : '#6b7280',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <Terminal size={16} /> Module 3: Mini SIEM Log Triage
          <span style={{ fontSize: '10px', background: '#374151', color: '#d1d5db', padding: '2px 6px', borderRadius: '4px' }}>Future</span>
        </button>
      </div>

      {/* Main Content Body */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {activeTab === 'phishing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            
            {/* Input Form Card */}
            <div style={{
              background: '#111827',
              borderRadius: '12px',
              border: '1px solid #1f2937',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={18} color="#38bdf8" /> Ingest Email Headers & Content
                  </h2>
                  <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                    Paste raw email headers (`.eml` content, RFC 822 format) or load a sample scenario.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={loadSampleEmail}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#38bdf8',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}>
                    ⚡ Load Suspicious Sample
                  </button>
                  <button 
                    onClick={() => { setRawEmail(''); setResult(null); }}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#94a3b8',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}>
                    Clear
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={rawEmail}
                onChange={(e) => setRawEmail(e.target.value)}
                placeholder="Paste raw email header & body here (e.g., From: ..., Return-Path: ..., Received-SPF: ...)"
                rows={8}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  padding: '14px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                  {loading ? 'Analyzing Artifacts...' : '🔍 Execute Phishing Triage'}
                </button>
              </div>
            </div>

            {/* Analysis Results View */}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Main Verdict Banner */}
                <div style={{
                  background: result.verdict_color === 'rose' 
                    ? 'linear-gradient(90deg, rgba(225, 29, 72, 0.15), rgba(15, 23, 42, 0.9))' 
                    : result.verdict_color === 'amber'
                    ? 'linear-gradient(90deg, rgba(217, 119, 6, 0.15), rgba(15, 23, 42, 0.9))'
                    : 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9))',
                  border: `1px solid ${
                    result.verdict_color === 'rose' ? '#f43f5e' : result.verdict_color === 'amber' ? '#f59e0b' : '#10b981'
                  }`,
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {result.verdict_color === 'rose' ? (
                      <ShieldAlert size={48} color="#f43f5e" />
                    ) : result.verdict_color === 'amber' ? (
                      <AlertTriangle size={48} color="#f59e0b" />
                    ) : (
                      <ShieldCheck size={48} color="#10b981" />
                    )}
                    <div>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af' }}>
                        Automated Triage Verdict
                      </span>
                      <h2 style={{ 
                        fontSize: '24px', 
                        fontWeight: '800', 
                        color: result.verdict_color === 'rose' ? '#f43f5e' : result.verdict_color === 'amber' ? '#f59e0b' : '#10b981' 
                      }}>
                        {result.verdict}
                      </h2>
                    </div>
                  </div>

                  {/* Risk Score Circle */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Calculated Risk Score</div>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: '800', 
                      color: result.verdict_color === 'rose' ? '#f43f5e' : result.verdict_color === 'amber' ? '#f59e0b' : '#10b981' 
                    }}>
                      {result.risk_score} <span style={{ fontSize: '16px', color: '#6b7280' }}>/ 100</span>
                    </div>
                  </div>
                </div>

                {/* 2. Three Pillar Inspection Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  
                  {/* Card A: Sender & Spoofing Check */}
                  <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                      <Mail size={16} /> Sender Identity & Spoof Check
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#9ca3af' }}>Display 'From':</span>
                        <div style={{ fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all', marginTop: '2px' }}>
                          {result.headers.from || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#9ca3af' }}>Envelope 'Return-Path':</span>
                        <div style={{ fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all', marginTop: '2px' }}>
                          {result.headers.return_path || 'N/A'}
                        </div>
                      </div>

                      <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', background: '#090d16', border: '1px solid #1f2937' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Domain Alignment:</span>
                        <div style={{ marginTop: '4px', fontWeight: '600', color: result.headers.from_domain === result.headers.return_path_domain ? '#34d399' : '#f87171' }}>
                          {result.headers.from_domain === result.headers.return_path_domain ? '✅ Aligned' : '❌ MISMATCH (Spoofing Likely)'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card B: Email Authentication (SPF, DKIM, DMARC) */}
                  <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                      <Shield size={16} /> Authentication Validation
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { name: 'SPF (Sender Policy)', val: result.authentication.spf },
                        { name: 'DKIM (Cryptographic Sig)', val: result.authentication.dkim },
                        { name: 'DMARC (Enforcement)', val: result.authentication.dmarc },
                      ].map((item, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#090d16',
                          borderRadius: '6px',
                          border: '1px solid #1f2937'
                        }}>
                          <span style={{ fontSize: '13px', color: '#d1d5db' }}>{item.name}</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: item.val === 'PASS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: item.val === 'PASS' ? '#34d399' : item.val === 'FAIL' ? '#f87171' : '#fbbf24'
                          }}>
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card C: Network & Origin Details */}
                  <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                      <Globe size={16} /> Originating Server IP
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#9ca3af' }}>Originating Relay IP:</span>
                        <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginTop: '4px' }}>
                          {result.network.defanged_ip}
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>* Automatically defanged for safe documentation</span>
                      </div>

                      <div>
                        <span style={{ color: '#9ca3af' }}>Subject Analyzed:</span>
                        <div style={{ color: '#e2e8f0', marginTop: '2px', fontStyle: 'italic' }}>
                          "{result.headers.subject || 'No Subject'}"
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Threat Findings Checklist */}
                {result.flags.length > 0 && (
                  <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} /> Identified Threat Indicators ({result.flags.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.flags.map((flag, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '10px 14px', 
                          background: '#090d16', 
                          borderRadius: '8px',
                          borderLeft: `4px solid ${flag.severity === 'HIGH' ? '#f43f5e' : '#f59e0b'}` 
                        }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            background: flag.severity === 'HIGH' ? '#ef4444' : '#f59e0b',
                            color: '#ffffff'
                          }}>
                            {flag.severity}
                          </span>
                          <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{flag.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Extracted URLs (Defanged) */}
                <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExternalLink size={16} /> Extracted URLs & Defanged Artifacts ({result.extracted_urls.length})
                  </h3>

                  {result.extracted_urls.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>No hyperlinks detected in email text.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '1px solid #1f2937', color: '#9ca3af' }}>
                            <th style={{ padding: '8px 12px' }}>#</th>
                            <th style={{ padding: '8px 12px' }}>Safe Defanged URL (Report Ready)</th>
                            <th style={{ padding: '8px 12px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.extracted_urls.map((u, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1f2937', background: '#090d16' }}>
                              <td style={{ padding: '10px 12px', color: '#6b7280' }}>{i + 1}</td>
                              <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#38bdf8' }}>
                                {u.defanged}
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(u.defanged);
                                    alert("Copied defanged URL to clipboard!");
                                  }}
                                  style={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#cbd5e1',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                  <Copy size={12} /> Copy
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab 2: Threat Intel Placeholder */}
        {activeTab === 'threat-intel' && (
          <div style={{ textAlign: 'center', padding: '64px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <Globe size={48} color="#38bdf8" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Module 2: Threat Intelligence & IOC Scanner</h2>
            <p style={{ color: '#9ca3af', maxWidth: '500px', margin: '8px auto 20px', fontSize: '14px' }}>
              We will build this next! You'll be able to query any IP, Domain, or File Hash with VirusTotal/AbuseIPDB reputation scoring.
            </p>
          </div>
        )}

        {/* Tab 3: Log Triage Placeholder */}
        {activeTab === 'log-triage' && (
          <div style={{ textAlign: 'center', padding: '64px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <Terminal size={48} color="#38bdf8" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Module 3: Mini SIEM Log Investigator</h2>
            <p style={{ color: '#9ca3af', maxWidth: '500px', margin: '8px auto 20px', fontSize: '14px' }}>
              Interactive Windows Event Log & Sysmon triage scenarios (Event 4625 Brute force, PowerShell base64 attacks).
            </p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #1f2937', 
        padding: '16px 32px', 
        fontSize: '12px', 
        color: '#6b7280',
        textAlign: 'center',
        background: '#090d16'
      }}>
        Virtual SOC Lab • Built for Cybersecurity Analysts & Incident Responders
      </footer>

    </div>
  );
}

