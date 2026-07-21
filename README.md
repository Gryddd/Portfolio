<p align="center">
</p>

<h1 align="center">Portfolio von Walid Gourideche</h1>
<h3 align="center">Angehender IT-Fachinformatiker für Systemintegration</h3>

<p align="center">
  <!-- Badges -->
  <img src="https://img.shields.io/badge/Status-Auf der Suche nach einer Ausbildung-blue?style=for-the-badge" alt="Status: Seeking Apprenticeship">
  <a href="https://www.linkedin.com/in/walidgourideche/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-Profil-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn Profile"></a>
</p>

<p align="center">
  <strong><a href="#english-version">View English Version</a></strong>
</p>

---

## 🇩🇪 Deutsche Version

### Sehr geehrte Personalverantwortliche,

herzlich willkommen auf meinem Portfolio. Mein Name ist Walid Gourideche, und ich bin ein motivierter angehender IT-Spezialist mit einem klaren Fokus auf **Systemintegration und Netzwerkadministration**. Dieses Portfolio wurde entwickelt, um meine praktischen Fähigkeiten und mein technisches Verständnis zu demonstrieren, die ich mir durch selbstgesteuerte Projekte und Praktika angeeignet habe. Mein Ziel ist es, eine **Ausbildung zum Fachinformatiker für Systemintegration** in Deutschland zu beginnen und meine Leidenschaft für die IT in einem professionellen Umfeld einzubringen.

### 🛠️ Technologie-Stack dieser Webseite

| Kategorie     | Technologien                               |
| ------------- | ------------------------------------------ |
| **Struktur**  | `HTML5`, `Semantisches Markup`             |
| **Styling**   | `CSS3`, `Responsive Design`, `Flexbox`     |
| **Logik**     | `Vanilla JavaScript (ES6+)`, `Sprach-Persistenz (Cookie/LocalStorage)` |
| **Features**  | `Mehrsprachig (DE/EN/FR)`, `PWA mit Offline-Modus`, `Live GitHub Profile Card` |
| **Deployment**| `GitHub Pages`, `Cloudflare Worker (SEO)`, `Custom Domain (grydsh.dev)` |

---

##  Showcased Projekte

### 1. Aufbau und Absicherung einer Unternehmens-IT-Infrastruktur

Dieses Projekt demonstriert den vollständigen Prozess der Erstellung und Absicherung eines virtuellen Unternehmensnetzwerks. Der Schwerpunkt liegt auf der Konfiguration von Kerndiensten und der Implementierung von Cybersicherheitsmaßnahmen zur Abwehr von Bedrohungen.

-   **Systemadministration:** Konfiguration eines **Windows Server 2022** als Domänencontroller (`homelab.local`) mit **Active Directory** und **DNS**.
-   **Netzwerk-Firewall:** Einsatz von **pfSense** zur Netzwerksegmentierung und als Gateway.
-   **Monitoring:** Echtzeit-Leistungsüberwachung der gesamten Infrastruktur mit **Netdata** via SNMP.
-   **Cybersecurity (IPS):** Implementierung des Intrusion Prevention Systems **Suricata** zur Erkennung und Abwehr eines simulierten Insider-Angriffs (Nmap-Scan).

### 2. PortGuardian Enterprise – USB-Schutzagent für Windows

Ein Windows-Endpunkt-Agent, getestet in einem VMware-basierten KMU-Labor. Er erkennt USB-Einsteckvorgänge, prüft verdächtige Dateien lokal und leitet Alarme an ein SIEM weiter.

-   **Erkennung:** **WMI-Ereignisse** erfassen neue USB-Medien in Echtzeit; eine **sechsstufige Analyse** bewertet die Dateien lokal.
-   **Reaktion:** Ab einem kritischen Score wirft der Agent das USB-Gerät automatisch aus und isoliert den Endpoint.
-   **SIEM-Anbindung:** Nur WARN- und CRITICAL-Ereignisse gehen per **Syslog (UDP 514)** an **Splunk Enterprise** auf einem Windows Server 2019.
-   **Stack:** **Python**, **Qt**, **Splunk**, **VMware**-Testlabor.

---

## Kernkompetenzen

#### Netzwerkadministration
- Cisco (IOS), GNS3, Wireshark, DNS, DHCP, TCP/IP, Subnetting, VLAN, Routing & Switching

#### Systemadministration
- Windows Server, Linux (Ubuntu/Debian), Active Directory, Hyper-V, VMware, Oracle Cloud, Python, Benutzerverwaltung

#### IT-Sicherheit
- pfSense, Suricata (IPS/IDS), Nmap, pfBlockerNG, Schwachstellenanalyse

#### Sprachen
- **Deutsch:** Goethe-Zertifikat B2 (ÖSD B2 geplant für September 2026)
- **Englisch:** Nahezu muttersprachlich (C2)
- **Französisch:** Fließend
- **Arabisch:** Muttersprache

---

## 🚀 Lokale Ausführung

Um eine lokale Kopie dieser Webseite zu betreiben:

1.  Klonen Sie das Repository:
    ```sh
    git clone https://github.com/Gryddd/Portfolio.git
    ```
2.  Öffnen Sie die `index.html`-Datei in Ihrem Browser. Es sind keine weiteren Build-Schritte erforderlich.

---
<br>

## 🇬🇧 English Version <a name="english-version"></a>

### Dear Hiring Managers,

Welcome to my portfolio. My name is Walid Gourideche, and I am a motivated aspiring IT specialist with a clear focus on **System Integration and Network Administration**. This portfolio was developed to demonstrate the practical skills and technical understanding I have acquired through self-directed projects and internships. My goal is to begin an **apprenticeship (`Ausbildung`) as an IT Specialist for System Integration** in Germany and to contribute my passion for IT in a professional environment.

### 🛠️ Technology Stack of This Website

| Category      | Technologies                               |
|---------------|--------------------------------------------|
| **Structure** | `HTML5`, `Semantic Markup`                 |
| **Styling**   | `CSS3`, `Responsive Design`, `Flexbox`     |
| **Logic**     | `Vanilla JavaScript (ES6+)`, `Language Persistence (Cookie/LocalStorage)` |
| **Features**  | `Multi-Language (DE/EN/FR)`, `PWA with Offline Mode`, `Live GitHub Profile Card` |
| **Deployment**| `GitHub Pages`, `Cloudflare Worker (SEO)`, `Custom Domain (grydsh.dev)` |

---

## Showcased Projects

### 1. Building and Securing an Enterprise IT Infrastructure

This project demonstrates the complete lifecycle of creating and securing a virtual enterprise network. The focus is on configuring core services and implementing cybersecurity measures to defend against threats.

-   **System Administration:** Configured a **Windows Server 2022** as a Domain Controller (`homelab.local`) with **Active Directory** and **DNS**.
-   **Network Firewall:** Deployed **pfSense** for network segmentation and gateway services.
-   **Monitoring:** Implemented real-time performance monitoring of all infrastructure with **Netdata** via SNMP.
-   **Cybersecurity (IPS):** Deployed the **Suricata** Intrusion Prevention System to detect and defend against a simulated insider threat (Nmap scan).

### 2. PortGuardian Enterprise – Windows USB Defense Agent

A Windows endpoint agent tested in a VMware-based small-enterprise lab. It detects USB insertions, scans suspicious files locally, and forwards alerts to a SIEM.

-   **Detection:** **WMI events** capture new USB media in real time; a **six-layer engine** scores the files locally.
-   **Response:** At a critical score, the agent automatically ejects the USB device and isolates the endpoint.
-   **SIEM Integration:** Only WARN and CRITICAL events are sent via **Syslog (UDP 514)** to **Splunk Enterprise** on a Windows Server 2019.
-   **Stack:** **Python**, **Qt**, **Splunk**, **VMware** lab.

---

## Core Competencies

#### Network Administration
- Cisco (IOS), GNS3, Wireshark, DNS, DHCP, TCP/IP, Subnetting, VLAN, Routing & Switching

#### System Administration
- Windows Server, Linux (Ubuntu/Debian), Active Directory, Hyper-V, VMware, Oracle Cloud, Python, User Management

#### IT Security
- pfSense, Suricata (IPS/IDS), Nmap, pfBlockerNG, Vulnerability Analysis

#### Languages
- **German:** Goethe-Certificate B2 (ÖSD B2 scheduled for September 2026)
- **English:** C2 (Professional Working Proficiency)
- **French:** Fluent
- **Arabic:** Native Speaker

---

## 🚀 Running Locally

To get a local copy up and running:

1.  Clone the repository:
    ```sh
    git clone https://github.com/Gryddd/Portfolio.git
    ```
2.  Open the `index.html` file in your browser. No build steps are required.
