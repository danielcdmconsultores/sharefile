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

// Application State
let peer = null;
let conn = null;
let fileReader = null;
let fileBuffer = []; // For receiver
let receivedSize = 0;
let fileSize = 0;
let fileName = '';
let speedInterval = null;
let lastBytes = 0;
let currentTransferBytes = 0;
let pendingFile = null;
let isTransferring = false;
let peerIsReady = false;

// Configuration
const CHUNK_SIZE = 16384; // 16KB chunks

// Initialize
init();

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const peerId = urlParams.get('to');

    if (peerId) {
        // We are RECEIVER
        initReceiver(peerId);
    } else {
        // We are SENDER
        initSender();
    }

    // Language selector
    dom.langSelector.value = currentLang;
    dom.langSelector.addEventListener('change', (e) => setLanguage(e.target.value));
    setLanguage(currentLang);

    // Event Listeners
    dom.copyBtn.addEventListener('click', copyLink);
    // dom.dropZone click handled natively by the overlay input
    dom.fileInput.addEventListener('change', handleFileSelection);
    dom.resetBtn.addEventListener('click', () => window.location.href = window.location.origin + window.location.pathname);

    // Modal Events
    dom.infoBtn.addEventListener('click', openInfoModal);
    dom.closeModalBtn.addEventListener('click', closeInfoModal);
    dom.closeModalBottomBtn.addEventListener('click', closeInfoModal);
    dom.infoModal.addEventListener('click', (e) => {
        if (e.target === dom.infoModal) closeInfoModal();
    });
}

function openInfoModal() {
    dom.infoModal.classList.remove('hidden');
    // Fetch README if empty (or always to keep fresh, let's allow refresh if closed)
    // Checking if already loaded to avoid refetching every time if desired,
    // but user requested "dynamic", so fetching is safer to ensure latest content if it changes safely.
    loadReadme();
}

function closeInfoModal() {
    dom.infoModal.classList.add('hidden');
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const t = translations[lang];

    // Update static elements with data-i18n
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

    // Update title/aria-labels if needed (handled via data-i18n or specific logic)

    // Update current status text if it's not a dynamic ID
    // Note: status text is often updated dynamically, so we need to be careful.
}

function loadReadme() {
    const readmeFile = currentLang === 'es' ? 'README.md' : 'README_en.md';
    fetch(readmeFile)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load ' + readmeFile);
            return response.text();
        })
        .then(text => {
            // Use marked to parse
            dom.readmeContent.innerHTML = marked.parse(text);
        })
        .catch(err => {
            dom.readmeContent.innerHTML = `<p style="color: var(--error)">${translations[currentLang].error_load_readme}${err.message}</p>`;
        });
}

// ------------------------------------------------
// PeerJS Setup
// ------------------------------------------------

function createPeer() {
    // 1. Enhanced ICE Servers (STUN/TURN) for better NAT traversal
    const peerConfig = {
        debug: 2, // Info level debug to see ICE connection states in console
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' },
                { urls: 'stun:stun.services.mozilla.com' },
                { urls: 'stun:stun.cloudflare.com:3478' }
            ],
            iceCandidatePoolSize: 10
        },
        // Resilience settings
        pingInterval: 5000
    };

    return new Peer(null, peerConfig);
}

function handlePeerReconnection() {
    if (peer && !peer.destroyed) {
        if (peer.disconnected) {
            console.log('Peer disconnected, attempting to reconnect...');
            peer.reconnect();
        }
    } else {
        console.log('Peer destroyed or null, re-initializing...');
        init();
    }
}

function updateStatus(status, key) {
    dom.connectionStatus.className = `status-badge ${status}`;
    dom.statusText.textContent = translations[currentLang][key] || key;
}

// ------------------------------------------------
// Sender Logic
// ------------------------------------------------

function initSender() {
    showView('home');
    dom.senderPersistentTools.classList.remove('hidden');
    updateStatus('connecting', 'status_connecting');

    peer = createPeer();

    peer.on('open', (id) => {
        updateStatus('disconnected', 'status_waiting_peer');
        const shareUrl = `${window.location.origin}${window.location.pathname}?to=${id}`;
        dom.shareInput.value = shareUrl;
    });

    peer.on('connection', (c) => {
        // When a receiver connects to us
        console.log('Receiver connection incoming...');
        if (isTransferring) {
            console.warn('Received connection while already transferring. Closing new connection.');
            c.on('open', () => c.close());
            return;
        }
        conn = c;
        peerIsReady = false; // reset for new connection
        setupConnectionEvents('Sender', c);
    });

    peer.on('error', (err) => {
        console.error('Peer Error:', err.type, err);
        
        if (err.type === 'unavailable-id') {
            // ID taken, should not happen with null ID but good to handle
            setTimeout(() => initSender(), 1000);
        } else if (err.type === 'disconnected' || err.type === 'network' || err.type === 'server-error') {
            updateStatus('disconnected', 'status_reconnecting');
            setTimeout(handlePeerReconnection, 3000);
        } else {
            updateStatus('disconnected', 'status_error');
            // Don't alert for every small issue, just show in status
            console.warn('Unhandled Peer error:', err.type);
        }
    });

    peer.on('disconnected', () => {
        updateStatus('disconnected', 'Disconnected. Retrying...');
        setTimeout(handlePeerReconnection, 3000);
    });
}
function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    pendingFile = file;

    if (peerIsReady && !isTransferring) {
        // Connected: Send immediately via our robust handler
        console.log('File selected and peer is ready. Sending immediately.');
        senderHandleReceiverReady(conn);
    } else {
        // Not connected: Queue and show info in drop-zone without switching view
        console.log('File queued. Waiting for connection or readiness...');
        updateStatus('disconnected', 'File ready. Waiting for peer...');
        
        // Provide visual feedback in the home view that the file is ready
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

    // Using reading file in chunks to prevent memory crash on large files
    const reader = new FileReader();

    reader.onload = (e) => {
        if (!peerIsReady || !conn) return; // Stop if disconnected

        conn.send({
            type: 'chunk',
            data: e.target.result
        });

        offset += e.target.result.byteLength;
        currentTransferBytes = offset;
        updateProgress(offset, file.size);

        if (offset < file.size) {
            readNextChunk();
        } else {
            // Done
            console.log('File sent successfully');
            isTransferring = false;
            stopSpeedTracker();
            conn.send({ type: 'end' });
            dom.transferPercent.textContent = translations[currentLang].transfer_completed;
            dom.transferActions.classList.remove('hidden');
            dom.downloadBtn.style.display = 'none'; // Sender doesn't download
        }
    };

    const readNextChunk = () => {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    };

    // Start reading
    readNextChunk();
}

// ------------------------------------------------
// Receiver Logic
// ------------------------------------------------

function initReceiver(targetId) {
    showView('receiver');
    updateStatus('connecting', 'status_connecting_sender');

    peer = createPeer();

    peer.on('open', (id) => {
        // Connect to the sender
        const c = peer.connect(targetId, {
            reliable: true
        });
        conn = c;
        setupConnectionEvents('Receiver', c);
    });

    peer.on('error', (err) => {
        console.error('Receiver Peer Error:', err.type, err);
        updateStatus('disconnected', 'status_disconnected');
        
        if (err.type === 'peer-unavailable') {
            // Sender might be offline or ID changed
            console.log('Target peer unavailable, will retry in 5s...');
            setTimeout(() => initReceiver(targetId), 5000);
        } else {
            setTimeout(handlePeerReconnection, 3000);
        }
    });

    peer.on('disconnected', () => {
        updateStatus('disconnected', 'Disconnected. Retrying...');
        setTimeout(handlePeerReconnection, 3000);
    });
}

// Called on the sender when the receiver is ready (either via 'open' event or 'ready' message).
// Uses isTransferring to ensure we only send once.
function senderHandleReceiverReady(c) {
    if (pendingFile && !isTransferring) {
        console.log('[Sender] Receiver ready - sending pending file:', pendingFile.name);
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
        console.log('[Sender] Receiver ready - no pending file, sending waiting-for-file');
        c.send({ type: 'waiting-for-file' });
        const dropText = dom.dropZone.querySelector('p');
        const dropTitle = dom.dropZone.querySelector('h3');
        if (dropText) dropText.textContent = translations[currentLang].drop_ready_hint;
        if (dropTitle) dropTitle.textContent = translations[currentLang].drop_ready_title;
    }
}

function handleData(data) {
    if (data.type === 'ready') {
        // Receiver confirms its data channel is open.
        console.log('[Sender] Received ready signal from receiver');
        peerIsReady = true;
        senderHandleReceiverReady(conn);
    } else if (data.type === 'metadata') {
        // Prepare to receive
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
        // File reception complete
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
// Shared Logic
// ------------------------------------------------

function setupConnectionEvents(role, c) {
    const handleOpen = () => {
        peerIsReady = true;
        updateStatus('connected', 'status_connected');
        console.log(`${role} data channel open.`);

        if (role === 'Receiver') {
            // Send a 'ready' message to tell the sender it can push data.
            console.log('Receiver sending ready signal');
            c.send({ type: 'ready' });
        } else if (role === 'Sender') {
            // Path 1: sender's own 'open' event fired first.
            // Try to send pending file immediately (path 2 is the 'ready' message from receiver).
            console.log('[Sender] handleOpen - checking for pending file');
            senderHandleReceiverReady(c);
        }
    };

    // ALWAYS use the event listener. c.open might be true internally before it's actually ready to send data payload reliably in PeerJS.
    c.on('open', handleOpen);

    c.on('data', (data) => {
        if (data.type === 'metadata') isTransferring = true;
        handleData(data);
    });

    c.on('close', () => {
        peerIsReady = false;
        isTransferring = false;
        updateStatus('disconnected', 'status_disconnected');
        console.log('Connection closed. Waiting for peer to reconnect...');
        if (role === 'Receiver') {
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const targetId = urlParams.get('to');
                if (targetId) initReceiver(targetId);
            }, 3000);
        }
    });

    c.on('error', (err) => {
        console.error('Connection error:', err);
        updateStatus('disconnected', 'status_error');
    });
}

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
    let lastAmount = currentTransferBytes;

    speedInterval = setInterval(() => {
        const currentAmount = currentTransferBytes;
        const diff = currentAmount - lastAmount;

        // Calculate speed in MB/s
        const speed = diff / (1024 * 1024);
        dom.transferSpeed.textContent = speed.toFixed(1) + ' MB/s';

        lastAmount = currentAmount;
    }, 1000);
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 ' + translations[currentLang].units[0];
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = translations[currentLang].units;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function stopSpeedTracker() {
    clearInterval(speedInterval);
}
