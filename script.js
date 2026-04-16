// DOM Elements
const views = {
    home: document.getElementById('view-home'),
    receiver: document.getElementById('view-receiver'),
    transfer: document.getElementById('view-transfer')
};

const dom = {
    connectionStatus: document.getElementById('connection-status'),
    statusText: document.getElementById('status-text'),
    shareInput: document.getElementById('share-link-input'),
    copyBtn: document.getElementById('copy-btn'),
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileName: document.getElementById('file-name'),
    fileSize: document.getElementById('file-size'),
    progressFill: document.getElementById('progress-fill'),
    transferPercent: document.getElementById('transfer-percentage'),
    transferSpeed: document.getElementById('transfer-speed'),
    downloadBtn: document.getElementById('download-btn'),
    resetBtn: document.getElementById('reset-btn'),
    transferActions: document.getElementById('transfer-actions'),

    // Header & Modal
    infoBtn: document.getElementById('info-btn'),
    infoModal: document.getElementById('info-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    readmeContent: document.getElementById('readme-content'),
    closeModalBottomBtn: document.getElementById('close-modal-bottom-btn'),
    senderPersistentTools: document.getElementById('sender-persistent-tools'),
    langSelector: document.getElementById('lang-selector')
};

const translations = {
    en: {
        status_initializing: "Initializing...",
        status_connecting: "Connecting to network...",
        status_waiting_peer: "Waiting for peer...",
        status_connecting_sender: "Connecting to sender...",
        status_reconnecting: "Network Error. Reconnecting...",
        status_disconnected: "Disconnected. Retrying...",
        status_connected: "Connected",
        status_sending: "Sending queued file...",
        status_receiving: "Receiving...",
        status_received: "Received Successfully",
        status_waiting_file: "Waiting for file...",
        status_error: "Network Error",
        status_retrying: "Retrying connection...",
        status_timeout: "Connection timed out. Retrying...",

        step_share_link: "Share your link",
        link_placeholder: "Generating secure link...",
        hint_send_link: "Send this link to the recipient to start.",

        hero_title: "Transfer Files <br>Without Limits",
        hero_subtitle: "Secure peer-to-peer sharing. No servers, no size limits, no ads.",

        drop_title: "Choose a file to share (copy and share the link first of course)",
        drop_hint: "Select now, send when connected.",
        drop_queued_title: "File Ready: ",
        drop_queued_hint: "File will be sent once peer connects. Keep this tab open and share the link.",
        drop_ready_title: "Transfer Ready",
        drop_ready_hint: "Peer connected. Ready to send.",

        receive_title: "Receiving File",
        receive_subtitle: "Connected securely to peer.",
        receive_loader: "Waiting for sender to choose file...",
        receive_connected: "Connected. Waiting for sender to select a file...",

        transfer_completed: "Completed",
        btn_download: "Download",
        btn_send_another: "Send Another",

        modal_title: "About ShareFile",
        btn_close: "Close",
        error_load_readme: "Error loading info: ",

        units: ['Bytes', 'KB', 'MB', 'GB', 'TB']
    },
    es: {
        status_initializing: "Inicializando...",
        status_connecting: "Conectando a la red...",
        status_waiting_peer: "Esperando par...",
        status_connecting_sender: "Conectando al remitente...",
        status_reconnecting: "Error de red. Reconectando...",
        status_disconnected: "Desconectado. Reintentando...",
        status_connected: "Conectado",
        status_sending: "Enviando archivo en cola...",
        status_receiving: "Recibiendo...",
        status_received: "Recibido con éxito",
        status_waiting_file: "Esperando archivo...",
        status_error: "Error de red",
        status_retrying: "Reintentando conexión...",
        status_timeout: "Tiempo de espera agotado. Reintentando...",

        step_share_link: "Comparte tu enlace",
        link_placeholder: "Generando enlace seguro...",
        hint_send_link: "Envía este enlace al destinatario para empezar.",

        hero_title: "Transfiere archivos <br>sin límites",
        hero_subtitle: "Uso compartido seguro de punto a punto. Sin servidores, sin límites de tamaño, sin anuncios.",

        drop_title: "Elige un archivo para compartir (copia y comparte el enlace primero, por supuesto)",
        drop_hint: "Selecciona ahora, envía cuando estés conectado.",
        drop_queued_title: "Archivo listo: ",
        drop_queued_hint: "el archivo se enviará una vez que el par se conecte. Mantén esta pestaña abierta y comparte el enlace.",
        drop_ready_title: "Transferencia lista",
        drop_ready_hint: "Par conectado. Listo para enviar.",

        receive_title: "Recibiendo archivo",
        receive_subtitle: "Conectado de forma segura al par.",
        receive_loader: "Esperando a que el remitente elija el archivo...",
        receive_connected: "Conectado. Esperando a que el remitente seleccione un archivo...",

        transfer_completed: "Completado",
        btn_download: "Descargar",
        btn_send_another: "Enviar otro",

        modal_title: "Acerca de ShareFile",
        btn_close: "Cerrar",
        error_load_readme: "Error al cargar la información: ",

        units: ['Bytes', 'KB', 'MB', 'GB', 'TB']
    }
};

let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('es') ? 'es' : 'en');

// ------------------------------------------------
// Application State
// ------------------------------------------------
let peer = null;
let conn = null;
let fileReader = null;
let fileBuffer = [];
let receivedSize = 0;
let fileSize = 0;
let fileName = '';
let speedInterval = null;
let currentTransferBytes = 0;
let pendingFile = null;
let isTransferring = false;
let peerIsReady = false;

// Resilience state
let retryCount = 0;
let retryTimer = null;
let connectionTimeoutTimer = null;
let currentRole = null;       // 'sender' | 'receiver'
let currentTargetId = null;   // receiver: the sender's peer ID

const MAX_RETRY_ATTEMPTS = 10;
const BASE_RETRY_DELAY_MS = 2000;
const MAX_RETRY_DELAY_MS = 30000;
const CONNECTION_TIMEOUT_MS = 20000; // 20-second handshake timeout

// Configuration
const CHUNK_SIZE = 16384; // 16KB chunks

// ------------------------------------------------
// Exponential Backoff Helpers
// ------------------------------------------------

function getRetryDelay() {
    // Exponential backoff with jitter: 2s, 4s, 8s … capped at 30s
    const exp = Math.min(retryCount, 10);
    const base = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, exp), MAX_RETRY_DELAY_MS);
    const jitter = Math.random() * 1000;
    return Math.round(base + jitter);
}

function scheduleRetry(fn) {
    clearTimeout(retryTimer);
    clearTimeout(connectionTimeoutTimer);

    if (retryCount >= MAX_RETRY_ATTEMPTS) {
        console.warn('[Resilience] Max retries reached. Giving up.');
        updateStatus('disconnected', 'status_error');
        return;
    }

    const delay = getRetryDelay();
    retryCount++;
    console.log(`[Resilience] Retry #${retryCount} in ${delay}ms`);
    updateStatus('disconnected', 'status_retrying');
    retryTimer = setTimeout(fn, delay);
}

function resetRetryCount() {
    retryCount = 0;
    clearTimeout(retryTimer);
    clearTimeout(connectionTimeoutTimer);
}

// ------------------------------------------------
// Peer Cleanup
// ------------------------------------------------

function destroyPeer() {
    clearTimeout(connectionTimeoutTimer);
    if (conn) {
        try { conn.close(); } catch (_) {}
        conn = null;
    }
    if (peer) {
        try { peer.destroy(); } catch (_) {}
        peer = null;
    }
    peerIsReady = false;
}

// ------------------------------------------------
// Initialize
// ------------------------------------------------

init();

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const peerId = urlParams.get('to');

    if (peerId) {
        currentRole = 'receiver';
        currentTargetId = peerId;
        initReceiver(peerId);
    } else {
        currentRole = 'sender';
        initSender();
    }

    dom.langSelector.value = currentLang;
    dom.langSelector.addEventListener('change', (e) => setLanguage(e.target.value));
    setLanguage(currentLang);

    dom.copyBtn.addEventListener('click', copyLink);
    dom.fileInput.addEventListener('change', handleFileSelection);
    dom.resetBtn.addEventListener('click', () => window.location.href = window.location.origin + window.location.pathname);

    dom.infoBtn.addEventListener('click', openInfoModal);
    dom.closeModalBtn.addEventListener('click', closeInfoModal);
    dom.closeModalBottomBtn.addEventListener('click', closeInfoModal);
    dom.infoModal.addEventListener('click', (e) => {
        if (e.target === dom.infoModal) closeInfoModal();
    });
}

function openInfoModal() {
    dom.infoModal.classList.remove('hidden');
    loadReadme();
}

function closeInfoModal() {
    dom.infoModal.classList.add('hidden');
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = t[key];
            } else {
                el.innerHTML = t[key];
            }
        }
    });
}

function loadReadme() {
    const readmeFile = currentLang === 'es' ? 'README.md' : 'README_en.md';
    fetch(readmeFile)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load ' + readmeFile);
            return response.text();
        })
        .then(text => {
            dom.readmeContent.innerHTML = marked.parse(text);
        })
        .catch(err => {
            dom.readmeContent.innerHTML = `<p style="color: var(--error)">${translations[currentLang].error_load_readme}${err.message}</p>`;
        });
}

// ------------------------------------------------
// PeerJS Factory
// ------------------------------------------------

function createPeer() {
    const peerConfig = {
        debug: 1,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' },
                { urls: 'stun:stun.services.mozilla.com' },
                { urls: 'stun:stun.cloudflare.com:3478' },
                // Public TURN relay – last resort when STUN / direct fails
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ],
            iceCandidatePoolSize: 10,
            iceTransportPolicy: 'all'
        },
        pingInterval: 5000
    };

    return new Peer(null, peerConfig);
}

function updateStatus(status, key) {
    dom.connectionStatus.className = `status-badge ${status}`;
    dom.statusText.textContent = translations[currentLang][key] || key;
}

// ------------------------------------------------
// Connection Timeout Guard
// ------------------------------------------------

/**
 * Start a watchdog: if data channel doesn't open within CONNECTION_TIMEOUT_MS,
 * tear down and retry.
 */
function startConnectionTimeout(retryFn) {
    clearTimeout(connectionTimeoutTimer);
    connectionTimeoutTimer = setTimeout(() => {
        if (!peerIsReady) {
            console.warn('[Resilience] Connection timeout – no data channel opened in time.');
            updateStatus('disconnected', 'status_timeout');
            destroyPeer();
            scheduleRetry(retryFn);
        }
    }, CONNECTION_TIMEOUT_MS);
}

// ------------------------------------------------
// Sender Logic
// ------------------------------------------------

function initSender() {
    showView('home');
    dom.senderPersistentTools.classList.remove('hidden');
    updateStatus('connecting', 'status_connecting');

    destroyPeer();
    peer = createPeer();

    peer.on('open', (id) => {
        resetRetryCount(); // successfully reached PeerJS server
        updateStatus('disconnected', 'status_waiting_peer');
        const shareUrl = `${window.location.origin}${window.location.pathname}?to=${id}`;
        dom.shareInput.value = shareUrl;
    });

    peer.on('connection', (c) => {
        console.log('[Sender] Incoming connection from receiver.');
        if (isTransferring) {
            console.warn('[Sender] Already transferring. Rejecting new connection.');
            c.on('open', () => c.close());
            return;
        }
        // Close any previous half-open connection
        if (conn && conn !== c) {
            try { conn.close(); } catch (_) {}
        }
        conn = c;
        peerIsReady = false;
        setupConnectionEvents('Sender', c, () => initSender());
    });

    peer.on('error', (err) => {
        console.error('[Sender] Peer error:', err.type, err);

        if (err.type === 'unavailable-id') {
            // Re-register with a fresh ID
            scheduleRetry(() => initSender());
        } else if (['disconnected', 'network', 'server-error'].includes(err.type)) {
            updateStatus('disconnected', 'status_reconnecting');
            scheduleRetry(() => initSender());
        } else {
            updateStatus('disconnected', 'status_error');
            console.warn('[Sender] Unhandled peer error type:', err.type);
        }
    });

    peer.on('disconnected', () => {
        console.warn('[Sender] Peer disconnected from signalling server.');
        updateStatus('disconnected', 'status_reconnecting');
        // Try cheap reconnect first before full re-init
        if (peer && !peer.destroyed) {
            try {
                peer.reconnect();
                return;
            } catch (_) {}
        }
        scheduleRetry(() => initSender());
    });

    peer.on('close', () => {
        console.warn('[Sender] Peer closed.');
        scheduleRetry(() => initSender());
    });
}

function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    pendingFile = file;

    if (peerIsReady && !isTransferring) {
        console.log('[Sender] File selected and peer ready. Sending immediately.');
        senderHandleReceiverReady(conn);
    } else {
        console.log('[Sender] File queued, waiting for peer.');
        updateStatus('disconnected', 'File ready. Waiting for peer...');

        const dropText = dom.dropZone.querySelector('p');
        const dropTitle = dom.dropZone.querySelector('h3');
        const dropIcon = dom.dropZone.querySelector('i');

        if (dropIcon) {
            dropIcon.className = 'ph-duotone ph-check-circle icon-large';
            dropIcon.style.color = 'var(--success)';
        }
        if (dropText) dropText.textContent = translations[currentLang].drop_queued_hint;
        if (dropTitle) dropTitle.textContent = translations[currentLang].drop_queued_title + file.name;
    }
}

function sendMetadata(file) {
    conn.send({
        type: 'metadata',
        name: file.name,
        size: file.size,
        fileType: file.type
    });
}

function sendFile(file) {
    let offset = 0;
    startSpeedTracker();

    const reader = new FileReader();

    reader.onload = (e) => {
        if (!peerIsReady || !conn) return; // Aborted – disconnected mid-transfer

        conn.send({ type: 'chunk', data: e.target.result });

        offset += e.target.result.byteLength;
        currentTransferBytes = offset;
        updateProgress(offset, file.size);

        if (offset < file.size) {
            readNextChunk();
        } else {
            console.log('[Sender] File sent successfully.');
            isTransferring = false;
            stopSpeedTracker();
            conn.send({ type: 'end' });
            dom.transferPercent.textContent = translations[currentLang].transfer_completed;
            dom.transferActions.classList.remove('hidden');
            dom.downloadBtn.style.display = 'none';
        }
    };

    reader.onerror = (e) => {
        console.error('[Sender] FileReader error:', e);
        isTransferring = false;
        stopSpeedTracker();
    };

    const readNextChunk = () => {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    };

    readNextChunk();
}

// ------------------------------------------------
// Receiver Logic
// ------------------------------------------------

function initReceiver(targetId) {
    showView('receiver');
    updateStatus('connecting', 'status_connecting_sender');

    destroyPeer();
    peer = createPeer();

    peer.on('open', () => {
        resetRetryCount();
        console.log('[Receiver] PeerJS open. Connecting to sender:', targetId);

        const c = peer.connect(targetId, { reliable: true });
        conn = c;
        setupConnectionEvents('Receiver', c, () => initReceiver(targetId));

        // Guard: if open never fires within timeout, retry
        startConnectionTimeout(() => initReceiver(targetId));
    });

    peer.on('error', (err) => {
        console.error('[Receiver] Peer error:', err.type, err);
        updateStatus('disconnected', 'status_disconnected');

        if (err.type === 'peer-unavailable') {
            // Sender may not be online yet – keep retrying
            console.log('[Receiver] Sender unavailable. Will retry...');
            scheduleRetry(() => initReceiver(targetId));
        } else if (['disconnected', 'network', 'server-error'].includes(err.type)) {
            scheduleRetry(() => initReceiver(targetId));
        } else {
            updateStatus('disconnected', 'status_error');
            scheduleRetry(() => initReceiver(targetId));
        }
    });

    peer.on('disconnected', () => {
        console.warn('[Receiver] Peer disconnected from signalling server.');
        updateStatus('disconnected', 'status_reconnecting');
        if (peer && !peer.destroyed) {
            try {
                peer.reconnect();
                return;
            } catch (_) {}
        }
        scheduleRetry(() => initReceiver(targetId));
    });

    peer.on('close', () => {
        console.warn('[Receiver] Peer closed.');
        scheduleRetry(() => initReceiver(targetId));
    });
}

// ------------------------------------------------
// Shared: Called when sender knows receiver is ready
// ------------------------------------------------

function senderHandleReceiverReady(c) {
    if (pendingFile && !isTransferring) {
        console.log('[Sender] Receiver ready – sending pending file:', pendingFile.name);
        showView('transfer');
        dom.fileName.textContent = pendingFile.name;
        dom.fileSize.textContent = formatBytes(pendingFile.size);
        dom.transferActions.classList.add('hidden');
        updateStatus('connected', 'status_sending');
        isTransferring = true;
        const fileToSend = pendingFile;
        pendingFile = null;
        sendMetadata(fileToSend);
        sendFile(fileToSend);
    } else if (!isTransferring) {
        console.log('[Sender] Receiver ready – no pending file yet. Sending waiting-for-file.');
        c.send({ type: 'waiting-for-file' });
        const dropText = dom.dropZone.querySelector('p');
        const dropTitle = dom.dropZone.querySelector('h3');
        if (dropText) dropText.textContent = translations[currentLang].drop_ready_hint;
        if (dropTitle) dropTitle.textContent = translations[currentLang].drop_ready_title;
    }
}

function handleData(data) {
    if (data.type === 'ready') {
        console.log('[Sender] Ready signal from receiver.');
        peerIsReady = true;
        senderHandleReceiverReady(conn);
    } else if (data.type === 'metadata') {
        fileBuffer = [];
        receivedSize = 0;
        fileSize = data.size;
        fileName = data.name;

        showView('transfer');
        dom.fileName.textContent = data.name;
        dom.fileSize.textContent = formatBytes(data.size);
        dom.transferActions.classList.add('hidden');
        updateStatus('connected', 'status_receiving');
        startSpeedTracker();
    } else if (data.type === 'chunk') {
        const arrayBuffer = data.data;
        fileBuffer.push(arrayBuffer);
        receivedSize += arrayBuffer.byteLength;
        currentTransferBytes = receivedSize;
        updateProgress(receivedSize, fileSize);
    } else if (data.type === 'end') {
        stopSpeedTracker();
        const blob = new Blob(fileBuffer);
        const url = URL.createObjectURL(blob);

        updateStatus('connected', 'status_received');
        isTransferring = false;
        dom.transferPercent.textContent = translations[currentLang].transfer_completed;
        dom.transferActions.classList.remove('hidden');
        dom.downloadBtn.style.display = 'flex';

        dom.downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    } else if (data.type === 'waiting-for-file') {
        const loaderText = document.querySelector('#receiver-loader p');
        if (loaderText) loaderText.textContent = translations[currentLang].receive_connected;
        updateStatus('connected', 'status_waiting_file');
    }
}

// ------------------------------------------------
// Shared Connection Event Setup
// ------------------------------------------------

function setupConnectionEvents(role, c, retryFn) {
    let opened = false; // guard against duplicate open events

    const handleOpen = () => {
        if (opened) return;
        opened = true;
        clearTimeout(connectionTimeoutTimer); // Cancel timeout – we made it!
        resetRetryCount();                   // Reset backoff counter on success
        peerIsReady = true;
        updateStatus('connected', 'status_connected');
        console.log(`[${role}] Data channel open.`);

        if (role === 'Receiver') {
            console.log('[Receiver] Sending ready signal.');
            c.send({ type: 'ready' });
        } else if (role === 'Sender') {
            senderHandleReceiverReady(c);
        }
    };

    c.on('open', handleOpen);

    // Some PeerJS versions fire open synchronously or before listener is set
    if (c.open) {
        Promise.resolve().then(handleOpen);
    }

    c.on('data', (data) => {
        if (data.type === 'metadata') isTransferring = true;
        handleData(data);
    });

    c.on('close', () => {
        peerIsReady = false;
        isTransferring = false;
        stopSpeedTracker();
        updateStatus('disconnected', 'status_disconnected');
        console.log(`[${role}] Data channel closed.`);

        if (role === 'Receiver' && retryFn) {
            scheduleRetry(retryFn);
        }
        // Sender: wait for peer to re-connect via new incoming connection
    });

    c.on('error', (err) => {
        console.error(`[${role}] Connection error:`, err);
        peerIsReady = false;
        updateStatus('disconnected', 'status_error');
        if (retryFn) scheduleRetry(retryFn);
    });
}

// ------------------------------------------------
// UI Helpers
// ------------------------------------------------

function showView(viewId) {
    Object.values(views).forEach(el => el.classList.remove('active'));
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewId].classList.remove('hidden');
    views[viewId].classList.add('active');
}

function copyLink() {
    dom.shareInput.select();
    document.execCommand('copy');

    const icon = dom.copyBtn.querySelector('i');
    const originalClass = icon.className;
    icon.className = 'ph-bold ph-check';
    dom.copyBtn.style.background = 'var(--success)';

    setTimeout(() => {
        icon.className = originalClass;
        dom.copyBtn.style.background = '';
    }, 2000);
}

function updateProgress(current, total) {
    const percent = Math.min(100, Math.round((current / total) * 100));
    dom.progressFill.style.width = `${percent}%`;
    dom.transferPercent.textContent = `${percent}%`;
}

function startSpeedTracker() {
    stopSpeedTracker();
    let lastAmount = currentTransferBytes;
    speedInterval = setInterval(() => {
        const diff = currentTransferBytes - lastAmount;
        const speed = diff / (1024 * 1024);
        dom.transferSpeed.textContent = speed.toFixed(1) + ' MB/s';
        lastAmount = currentTransferBytes;
    }, 1000);
}

function stopSpeedTracker() {
    clearInterval(speedInterval);
    speedInterval = null;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 ' + translations[currentLang].units[0];
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = translations[currentLang].units;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
