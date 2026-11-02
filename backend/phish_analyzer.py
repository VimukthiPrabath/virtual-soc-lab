import re
import email
from email import policy
from typing import Dict, Any, List

def defang_url(url: str) -> str:
    """Turn clickable URL into safe defanged text (e.g., http://evil[.]com)"""
    url = url.replace("http://", "hxxp://").replace("https://", "hxxps://")
    return re.sub(r'\.(?=[a-zA-Z0-9])', '[.]', url)

def defang_ip(ip: str) -> str:
    """Turn IP into defanged text (e.g., 192.168.1[.]1)"""
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.{parts[2]}[.]{parts[3]}"
    return ip

def extract_domain(address: str) -> str:
    """Extract domain part from an email address"""
    if "@" in address:
        clean = address.strip("<> \t\n\r\"'")
        return clean.split("@")[-1].lower()
    return ""

def analyze_email_header(raw_content: str) -> Dict[str, Any]:
    """
    Parses email headers and analyzes security indicators:
    - From vs Return-Path Spoofing
    - SPF / DKIM / DMARC status
    - Mail Hops & Origin IP
    - Extracted & Defanged URLs
    - Risk Score calculation
    """
    msg = email.message_from_string(raw_content, policy=policy.default)
    
    from_header = msg.get("From", "")
    to_header = msg.get("To", "")
    subject_header = msg.get("Subject", "")
    date_header = msg.get("Date", "")
    return_path = msg.get("Return-Path", "")
    auth_results = msg.get("Authentication-Results", "")
    received_spf = msg.get("Received-SPF", "")
    dkim_signature = msg.get("DKIM-Signature", "")
    
    # 1. Domain Spoofing Check
    from_domain = extract_domain(from_header)
    return_path_domain = extract_domain(return_path)
    
    spoofing_detected = False
    spoofing_reason = ""
    if from_domain and return_path_domain:
        if from_domain != return_path_domain:
            spoofing_detected = True
            spoofing_reason = f"Domain mismatch: 'From' is @{from_domain} but 'Return-Path' bounces to @{return_path_domain}"
    
    # 2. SPF, DKIM, DMARC Parsing
    auth_lower = f"{auth_results} {received_spf}".lower()
    
    spf_status = "UNKNOWN"
    if "spf=pass" in auth_lower or "pass" in received_spf.lower():
        spf_status = "PASS"
    elif "spf=fail" in auth_lower or "fail" in received_spf.lower():
        spf_status = "FAIL"
    elif "spf=softfail" in auth_lower or "softfail" in received_spf.lower():
        spf_status = "SOFTFAIL"
    elif "spf=neutral" in auth_lower:
        spf_status = "NEUTRAL"
        
    dkim_status = "UNKNOWN"
    if "dkim=pass" in auth_lower:
        dkim_status = "PASS"
    elif "dkim=fail" in auth_lower:
        dkim_status = "FAIL"
    elif dkim_signature:
        dkim_status = "PRESENT (Not Validated)"
        
    dmarc_status = "UNKNOWN"
    if "dmarc=pass" in auth_lower:
        dmarc_status = "PASS"
    elif "dmarc=fail" in auth_lower:
        dmarc_status = "FAIL"
        
    # 3. Origin IP extraction from Received headers
    received_headers = msg.get_all("Received", [])
    origin_ip = "Unknown"
    ip_pattern = r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'
    
    # Check last received header for initial hop IP
    for rh in reversed(received_headers):
        ips = re.findall(ip_pattern, str(rh))
        public_ips = [ip for ip in ips if not (ip.startswith("127.") or ip.startswith("10.") or ip.startswith("192.168."))]
        if public_ips:
            origin_ip = public_ips[0]
            break

    # 4. Extract URLs from body & text
    url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    all_urls = re.findall(url_pattern, raw_content)
    # Deduplicate while preserving order
    unique_urls = list(dict.fromkeys(all_urls))
    defanged_urls = [{"original": u, "defanged": defang_url(u)} for u in unique_urls]

    # 5. Risk Assessment Engine
    risk_score = 0
    flags = []
    
    if spoofing_detected:
        risk_score += 40
        flags.append({"severity": "HIGH", "message": spoofing_reason})
        
    if spf_status == "FAIL":
        risk_score += 30
        flags.append({"severity": "HIGH", "message": "SPF check failed (Unauthorized sender IP)."})
    elif spf_status == "SOFTFAIL":
        risk_score += 15
        flags.append({"severity": "MEDIUM", "message": "SPF Softfail: IP is possibly not authorized."})
        
    if dmarc_status == "FAIL":
        risk_score += 25
        flags.append({"severity": "HIGH", "message": "DMARC policy validation failed."})
        
    if dkim_status == "FAIL":
        risk_score += 20
        flags.append({"severity": "MEDIUM", "message": "DKIM signature invalid or altered."})

    # Check for urgent/phishing keywords in subject
    urgent_keywords = ["urgent", "suspended", "verify your account", "action required", "unauthorized login", "password reset", "invoice", "bank"]
    matched_keywords = [kw for kw in urgent_keywords if kw in subject_header.lower()]
    if matched_keywords:
        risk_score += 15
        flags.append({"severity": "MEDIUM", "message": f"Suspicious urgency keywords detected in Subject: {', '.join(matched_keywords)}"})

    if len(defanged_urls) > 0:
        # Check for lookalike / suspicious TLDs or IP addresses in URLs
        for item in defanged_urls:
            raw_u = item["original"]
            if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', raw_u):
                risk_score += 20
                flags.append({"severity": "HIGH", "message": f"URL uses raw IP instead of domain name: {item['defanged']}"})
                break

    # Determine Verdict
    verdict = "CLEAN"
    verdict_color = "emerald" # Green
    if risk_score >= 60:
        verdict = "MALICIOUS (PHISHING)"
        verdict_color = "rose" # Red
    elif risk_score >= 30:
        verdict = "SUSPICIOUS"
        verdict_color = "amber" # Yellow

    return {
        "verdict": verdict,
        "verdict_color": verdict_color,
        "risk_score": min(risk_score, 100),
        "headers": {
            "from": from_header,
            "to": to_header,
            "subject": subject_header,
            "date": date_header,
            "return_path": return_path,
            "from_domain": from_domain,
            "return_path_domain": return_path_domain,
        },
        "authentication": {
            "spf": spf_status,
            "dkim": dkim_status,
            "dmarc": dmarc_status,
        },
        "network": {
            "origin_ip": origin_ip,
            "defanged_ip": defang_ip(origin_ip) if origin_ip != "Unknown" else "Unknown"
        },
        "flags": flags,
        "extracted_urls": defanged_urls
    }

