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
    transferActions: document.getElementById('transfer-actions')
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
}

// ------------------------------------------------
// PeerJS Setup
// ------------------------------------------------

function createPeer() {
    // Generate a random ID with a prefix for clarity, or let PeerJS generate one.
    // Using default PeerJS cloud server.
    // 1. Setup ICE/STUN servers for better NAT traversal
    const peerConfig = {
        debug: 2,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
            ]
        }
    };

    /**
     * TURN SERVER CONFIGURATION (Optional but recommended for strict NATs)
     * If you have a TURN server (e.g., from Metered.ca, Twilio, or self-hosted),
     * uncomment the block below and add your credentials.
     */
    /*
    peerConfig.config.iceServers.push({
        urls: 'turn:your-turn-server.com:3478',
        username: 'your-username',
        credential: 'your-password'
    });
    */

    return new Peer(null, peerConfig);
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
    updateStatus('connecting', 'Connecting to network...');

    peer = createPeer();

    peer.on('open', (id) => {
        updateStatus('disconnected', 'Waiting for peer...');
        const shareUrl = `${window.location.origin}${window.location.pathname}?to=${id}`;
        dom.shareInput.value = shareUrl;
    });

    peer.on('connection', (c) => {
        // When a receiver connects to us
        conn = c;
        setupConnectionEvents('Sender');
    });

    peer.on('error', (err) => {
        console.error(err);
        updateStatus('disconnected', 'Network Error');
        alert('An error occurred: ' + err.type);
    });
}

function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!conn || !conn.open) {
        alert('Peer not connected yet!');
        return;
    }

    // Switch to transfer view
    showView('transfer');
    dom.fileName.textContent = file.name;
    dom.fileSize.textContent = formatBytes(file.size);
    dom.transferActions.classList.add('hidden');

    // 1. Send Metadata
    conn.send({
        type: 'metadata',
        name: file.name,
        size: file.size,
        fileType: file.type
    });

    // 2. Start sending chunks
    sendFile(file);
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
            stopSpeedTracker();
            conn.send({ type: 'end' });
            dom.transferPercent.textContent = 'Completed';
            dom.resetBtn.parentElement.classList.remove('hidden');
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
        conn = peer.connect(targetId, {
            reliable: true
        });
        setupConnectionEvents('Receiver');
    });

    peer.on('error', (err) => {
        console.error(err);
        updateStatus('disconnected', 'Connection Failed');
        alert('Could not connect to peer. Ensure the link is correct and the sender is still online.');
    });
}

function handleData(data) {
    if (data.type === 'metadata') {
        // Prepare to receive
        fileBuffer = [];
        receivedSize = 0;
        fileSize = data.size;
        fileName = data.name;

        showView('transfer');
        dom.fileName.textContent = data.name;
        dom.fileSize.textContent = formatBytes(data.size);
        dom.transferActions.classList.add('hidden');

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
    }
}

// ------------------------------------------------
// Shared Logic
// ------------------------------------------------

function setupConnectionEvents(role) {
    conn.on('open', () => {
        updateStatus('connected', 'Connected');
        console.log(`${role} connected to peer`);

        if (role === 'Sender') {
            // Enable drop zone
            dom.dropZone.classList.remove('disabled');
            dom.fileInput.disabled = false;
            dom.dropZone.querySelector('p').textContent = 'Peer connected. Click to choose file.';
            dom.dropZone.querySelector('h3').textContent = 'Ready to Send';
        }
    });

    conn.on('data', (data) => {
        if (role === 'Receiver') {
            handleData(data);
        }
    });

    conn.on('close', () => {
        updateStatus('disconnected', 'Peer Disconnected');
        alert('Peer disconnected.');
        // Optionally reset UI
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
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
