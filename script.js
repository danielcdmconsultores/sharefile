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
    senderPersistentTools: document.getElementById('sender-persistent-tools')
};

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

    // Event Listeners
    dom.copyBtn.addEventListener('click', copyLink);
    // dom.dropZone click handled natively by the overlay input
    dom.fileInput.addEventListener('change', handleFileSelection);
    dom.resetBtn.addEventListener('click', () => window.location.href = window.location.origin + window.location.pathname);

    // Modal Events
    dom.infoBtn.addEventListener('click', openInfoModal);
    dom.closeModalBtn.addEventListener('click', closeInfoModal);
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

function loadReadme() {
    fetch('README.md')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load README.md');
            return response.text();
        })
        .then(text => {
            // Use marked to parse
            dom.readmeContent.innerHTML = marked.parse(text);
        })
        .catch(err => {
            dom.readmeContent.innerHTML = `<p style="color: var(--error)">Error loading info: ${err.message}</p>`;
        });
}

// ------------------------------------------------
// PeerJS Setup
// ------------------------------------------------

function createPeer() {
    // 1. Enhanced ICE Servers (STUN/TURN) for better NAT traversal
    const peerConfig = {
        debug: 1, // Reduced debug for production-like feel
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
                // Public TURN server (using a semi-reliable one as fallback)
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

function updateStatus(status, text) {
    dom.connectionStatus.className = `status-badge ${status}`;
    dom.statusText.textContent = text;
}

// ------------------------------------------------
// Sender Logic
// ------------------------------------------------

function initSender() {
    showView('home');
    dom.senderPersistentTools.classList.remove('hidden');
    updateStatus('connecting', 'Connecting to network...');

    peer = createPeer();

    peer.on('open', (id) => {
        updateStatus('disconnected', 'Waiting for peer...');
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
        setupConnectionEvents('Sender', c);
    });

    peer.on('error', (err) => {
        console.error('Peer Error:', err.type, err);
        
        if (err.type === 'unavailable-id') {
            // ID taken, should not happen with null ID but good to handle
            setTimeout(() => initSender(), 1000);
        } else if (err.type === 'disconnected' || err.type === 'network' || err.type === 'server-error') {
            updateStatus('disconnected', 'Network Error. Reconnecting...');
            setTimeout(handlePeerReconnection, 3000);
        } else {
            updateStatus('disconnected', 'Network Error');
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

    if (conn && conn.open && !isTransferring) {
        // Connected: Switch view and send immediately
        showView('transfer');
        dom.fileName.textContent = file.name;
        dom.fileSize.textContent = formatBytes(file.size);
        dom.transferActions.classList.add('hidden');
        dom.statusText.textContent = "Sending...";
        isTransferring = true;
        sendMetadata(file);
        sendFile(file);
    } else {
        // Not connected: Queue and show info in drop-zone without switching view
        pendingFile = file;
        console.log('File queued. Waiting for connection...');
        updateStatus('disconnected', 'File ready. Waiting for peer...');
        
        // Provide visual feedback in the home view that the file is ready
        const dropText = dom.dropZone.querySelector('p');
        const dropTitle = dom.dropZone.querySelector('h3');
        const dropIcon = dom.dropZone.querySelector('i');

        if (dropIcon) {
            dropIcon.className = 'ph-duotone ph-check-circle icon-large';
            dropIcon.style.color = 'var(--success)';
        }
        if (dropText) dropText.textContent = 'File will be sent once peer connects. Keep this tab open and share the link.';
        if (dropTitle) dropTitle.textContent = 'File Ready: ' + file.name;
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
        if (!conn || !conn.open) return; // Stop if disconnected

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
            dom.transferPercent.textContent = 'Completed';
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
    updateStatus('connecting', 'Connecting to sender...');

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
        updateStatus('disconnected', 'Connection Error. Retrying...');
        
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
        updateStatus('connected', 'Sending queued file...');
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
        if (dropText) dropText.textContent = 'Peer connected. Ready to send.';
        if (dropTitle) dropTitle.textContent = 'Transfer Ready';
    }
}

function handleData(data) {
    if (data.type === 'ready') {
        // Receiver confirms its data channel is open.
        console.log('[Sender] Received ready signal from receiver');
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
        dom.statusText.textContent = "Receiving...";

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

        updateStatus('connected', 'Received Successfully');
        isTransferring = false;
        dom.transferPercent.textContent = 'Completed';
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
        if (loaderText) loaderText.textContent = 'Connected. Waiting for sender to select a file...';
        updateStatus('connected', 'Waiting for file...');
    }
}

// ------------------------------------------------
// Shared Logic
// ------------------------------------------------

function setupConnectionEvents(role, c) {
    const handleOpen = () => {
        updateStatus('connected', 'Connected');
        console.log(`${role} data channel open. c.open=${c.open}`);

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

    if (c.open) {
        handleOpen();
    } else {
        c.on('open', handleOpen);
    }

    c.on('data', (data) => {
        if (data.type === 'metadata') isTransferring = true;
        handleData(data);
    });

    c.on('close', () => {
        isTransferring = false;
        updateStatus('disconnected', 'Peer Disconnected');
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
        updateStatus('disconnected', 'Connection Error');
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function stopSpeedTracker() {
    clearInterval(speedInterval);
}
