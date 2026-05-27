# **ShareFile** – Secure P2P file transfer, without servers

> **Creator's Notice**: The author is not responsible for the content shared or any damage caused by the use of the application. Use it at your own risk.

---

## 📦 What is ShareFile?

- **Web application** that allows sending files directly from one browser to another, without passing through storage servers.
- **No installation required**: just open the URL `https://danielcdmconsultores.github.io/sharefile/`.
- **End-to-end encryption**: data travels encrypted, so no one on the network can read it.
- **Free of ads, trackers, and malware** – the code is open and includes no third-party advertising.

---

## ⚙️ How does it work (without getting technical)?

1. **Unique Identifier**
   Every time you open the page, and copy the URL, the browser creates an **ID** that identifies it on the network. Think of it as a virtual phone number (it's in the URL itself).

2. **Lightweight Signaling**
   For two browsers to "find" each other, they first exchange their IDs through a **small signaling server**. This server only passes IDs, **it does not store or see** the files, typical in P2P. They are in script.js and are usually the typical Google ones like stun:stun.l.google.com

3. **Direct Connection**
   Once each party knows the other's ID, thanks to the **PeerJS library**, it manages everything necessary to open a direct tunnel between the browsers.
   - The library handles the "negotiation" (who sends first, how they connect, etc.).
   - After negotiation, the browsers communicate **directly**, as if they were connected by a secure virtual cable.

4. **Data Transfer**
   The file is broken into small chunks and sent through the tunnel. Each chunk arrives in order and without being lost, because the library itself takes care of reliability.

5. **End of Session**
   When the last chunk arrives, the receiver reassembles the file and offers it for download. The entire process occurs in the memory of the two browsers; when you close this web tab, it disappears.

---

## 🧑‍🤝‍🧑 Step-by-Step Example: Source ↔︎ Destination

Imagine **Ana** (who sends) and **Luis** (who receives).

| Step | What Ana does (source) | What Luis does (destination) |
|------|----------------------|------------------------|
| **1** | Opens the page in her browser → the app shows a URL with an **embedded ID**. | Pastes the URL into another destination browser. |
| **2** | Shows connected status. Selects the file to send. | Shows waiting for file status. |
| **3** | The PeerJS library opens the direct connection and starts sending file chunks. | Each chunk arrives and the application saves them in memory. |
| **5** | When finished, the app informs Luis that the transfer has ended. | Luis receives a **"Download"** button; clicking it saves the file to his device. |
| **6** | Both tabs can be closed; the files are not stored on any server. | — |

> **In summary:** Ana and Luis only exchange their IDs, the PeerJS library does the rest, and the file travels directly from one browser to another, fully encrypted.

---

## 🚀 Quick Start Guide (for anyone)

1. **Open the URL** in **two browsers** (they can be on the same computer, another computer, or a mobile phone).
2. **Share the URL** with the other person through any means you consider secure (WhatsApp, email, QR).
3. Select the file to send.
4. You will see a progress bar on both screens.
5. When the **"Download"** button appears, simply click to save the file.

---

## 🔐 Security and Privacy

| Topic | What ShareFile guarantees |
|------|--------------------------|
| **Encryption** | Data travels encrypted; no one can intercept the content without breaking the encryption layer. |
| **No Storage** | The signaling server only passes IDs. Files are never stored or copied on any server. |
| **Mandatory HTTPS** | The application only works under a secure connection (HTTPS), preventing "man-in-the-middle" attacks. |
| **No Tracking** | No cookies or analytics scripts are used; the code is completely static. |
| **Temporary Memory** | Data is only kept in the browser's memory. When the tab is closed, they disappear. |

---

## ⚠️ Limitations and how to overcome them

| Possible issue | Why it happens | What you can do |
|------------------|----------------|-----------------|
| **Connection failed** (e.g., both behind strict firewalls) | The direct tunnel cannot be opened because routers block communication. | Change to a less restrictive network (e.g., home Wi-Fi) or use a mobile network. |
| **Slow transfer** | Traffic is passing through an intermediate server (relay). | Use a network with better link quality or, if you have the knowledge, deploy your own TURN server and configure it in the app (see *Contribute* section). |
| **Corrupt file** | Packet loss or library error. | In practice this is rare; if it happens, reload the page and try again. |
| **App not working** | It opens with HTTP instead of HTTPS or the browser is very outdated. | Ensure the URL starts with `https://` and update the browser to the latest version. |

---

## ❓ Frequently Asked Questions

**1. Do I need to create an account?**
No. You just open the page and the system automatically generates your ID.

**2. How many files can I send at the same time?**
You can open multiple simultaneous sessions, but the total speed will depend on your connection's bandwidth.

**3. What happens if I close the tab before the transfer ends?**
The transmission is cut. The other user will keep the chunks received until then, but the file will be incomplete.

**4. Can I use the app from a mobile?**
Yes. It works on modern mobile browsers as long as they have WebRTC support (Chrome, Edge, Firefox, Safari).

**5. Can files be infected with viruses?**
ShareFile does not scan files. The receiver must check them with their antivirus before opening them, as they would with any file received by any means.

---

## 🔄 Recent Improvements (Updates)

To ensure the best experience and reliability, ShareFile has recently received the following updates:

1. **High Connection Reliability (NAT Traversal)**
   - Replaced the use of limited TURN servers with a robust set of **high-availability public STUN servers** (Google, Cloudflare, Mozilla).
   - Completely rewrote the connection state machine to ensure the file transfer starts flawlessly whether the file is selected before, during, or after the recipient opens the link.
   - **Flow Control (Backpressure):** Implemented flow control utilizing `bufferedAmount` and the `onbufferedamountlow` event of the native WebRTC data channel. This prevents buffer saturation and sudden disconnects during transfers over slow networks or TURN relays.

2. **Usability Improvements (UX)**
   - **Persistent Link:** The sender now always has the sharing link in view, even after selecting the file to send.
   - **Visual Feedback:** The upload zone clearly indicates when a file is queued waiting for the recipient to connect.

3. **Accessibility (A11y)**
   - Functional labels (`aria-label` and `title`) have been added to all icon buttons to ensure the application is fully usable via screen readers and provides *tooltips* on hover.

---

### 🎉 Ready!

By simply opening a page and sharing a small link, you can send files securely without depending on external services. Enjoy direct, **server-free** transfer!
