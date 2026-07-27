# **ShareFile** – Secure P2P file transfer, without servers

> **Creator's Notice**: The author is not responsible for the content shared or any damage caused by the use of the application. Use it at your own risk.

---

## 📦 What is ShareFile?

- **Web application** that allows sending files directly from one browser to another, without passing through storage servers.
- **No installation required**: just open the URL [https://danielcdmconsultores.github.io/sharefile/](https://danielcdmconsultores.github.io/sharefile/).
- **End-to-end encryption**: data travels encrypted via WebRTC (DTLS/SRTP), so no one on the network can read it.
- **Free of ads, trackers, and malware** – the code is open and includes no third-party advertising.

---

## ⚙️ How does it work (without getting technical)?

1. **Unique Identifier**
   Every time you open the page, the browser creates an **ID** that identifies it on the network.
2. **Lightweight Signaling**
   To find each other, browsers exchange IDs via a signaling server (default PeerJS or custom PeerServer if configured). The server only passes IDs, **does not store or see** files.
3. **Direct Connection**
   Once IDs are exchanged, the PeerJS library opens a direct WebRTC tunnel between browsers.
4. **Data Transfer**
   The file is broken into 16KB binary chunks and sent through the tunnel with backpressure flow control.
5. **End of Session**
   The receiver reassembles the file in memory and provides a download button. When tabs are closed, data is cleared from RAM.

---

## 🚀 Quick Start Guide

1. **Open the URL** in your browser.
2. **Share the link** (`?to=YOUR_ID`) with the recipient.
3. Select the file to send (can be queued before or after the recipient opens the link).
4. Watch the progress bar on both screens.
5. When the **"Download"** button appears, click to save the file.

---

## 🔐 Security and Privacy

| Topic | What ShareFile guarantees |
|------|--------------------------|
| **Encryption** | End-to-end encryption (DTLS/SRTP); no one can intercept content. |
| **No Storage** | Files are never stored on any server. They reside only in RAM during transfer. |
| **Mandatory HTTPS** | The application runs under secure HTTPS. |
| **No Tracking** | 100% static code free of trackers or cookies. |

---

## 🔄 Recent Improvements & Advanced Tools

1. **Evolution to OKF v0.2 Knowledge Base**
   - Technical documentation has been updated to the **OKF v0.2** specification with YAML Frontmatter blocks on all concept modules under [okf/](file:///c:/Users/danie/apps/sharefile/sharefile/okf/index.md).

2. **Advanced Network Settings Panel (`#settings-modal`)**
   - Configure private TURN/TURNS servers or custom PeerServer signaling (Host, Port, Path, TLS) for restricted enterprise environments. Local persistence in `localStorage`.

3. **Real-Time Network Diagnostics Console (`#diagnostics-container`)**
   - Live monitoring of discovered ICE candidates (`Host`, `Srflx`, `Relay`), signaling channel state, and active P2P connection type.

4. **Resilience & Flow Control (Backpressure)**
   - Exponential backoff reconnects with jitter, connection watchdogs, and flow control using `bufferedAmount` to prevent buffer overflow.

---

## 📚 Technical Documentation (OKF v0.2)

For developers and AI agents, the complete technical knowledge base is located at **[okf/index.md](file:///c:/Users/danie/apps/sharefile/sharefile/okf/index.md)**:

- [Network Architecture](file:///c:/Users/danie/apps/sharefile/sharefile/okf/architecture/architecture.md)
- [Core Concepts (STUN/TURN/ICE/Chunking)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/concepts/concepts.md)
- [Modules & Components](file:///c:/Users/danie/apps/sharefile/sharefile/okf/modules/modules.md)
- [Architectural Decision Records (ADR)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/decisions/decisions.md)
- [Interfaces & Protocol](file:///c:/Users/danie/apps/sharefile/sharefile/okf/interfaces/interfaces.md)
- [Workflows](file:///c:/Users/danie/apps/sharefile/sharefile/okf/workflows/workflows.md)
- [Conventions & Resilience](file:///c:/Users/danie/apps/sharefile/sharefile/okf/conventions/conventions.md)
- [Update Log](file:///c:/Users/danie/apps/sharefile/sharefile/okf/log.md)

---

### 🎉 Ready!

By simply opening a page and sharing a link, you can send files securely without depending on external services. Enjoy direct, **server-free** transfer!
