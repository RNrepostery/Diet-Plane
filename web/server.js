const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 5173;
const PUBLIC_DIR = __dirname;

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Basic CORS and security headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let reqPath = decodeURI(req.url.split('?')[0]);

    // API endpoint for device pairing & network info
    if (reqPath === '/api/network-info') {
        const localIp = getLocalIp();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            localIp: localIp,
            port: PORT,
            networkUrl: `http://${localIp}:${PORT}`,
            localUrl: `http://localhost:${PORT}`
        }));
        return;
    }

    // Backend Validation API Endpoint: checks if a food is restricted for user's diseases
    if (reqPath === '/api/validate-diet-food' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const foodName = data.foodName || '';
                const userDiseases = data.userDiseases || (data.diseaseName ? [data.diseaseName] : ['Diabetes / Sugar']);
                
                let isRestricted = false;
                let matchedDisease = '';

                const dList = userDiseases.map(d => String(d).toLowerCase());
                const fn = foodName.toLowerCase();

                // Check Diabetes restrictions (Sugar, Sweets, Cake, Cold Drink, Sugary Juice)
                if (dList.some(d => d.includes('diabetes') || d.includes('sugar'))) {
                    if (fn.includes('sugar') || fn.includes('sweet') || fn.includes('cake') || fn.includes('cold drink') || fn.includes('sugary juice') || fn.includes('pastry') || fn.includes('soda')) {
                        isRestricted = true;
                        matchedDisease = 'Diabetes / Sugar';
                    }
                }

                // Check Hypertension restrictions
                if (dList.some(d => d.includes('hypertension') || d.includes('bp'))) {
                    if (fn.includes('pickle') || fn.includes('papad') || fn.includes('samosa') || fn.includes('salted')) {
                        isRestricted = true;
                        matchedDisease = 'Hypertension';
                    }
                }

                // Check CKD restrictions
                if (dList.some(d => d.includes('kidney') || d.includes('ckd'))) {
                    if (fn.includes('banana') || fn.includes('spinach') || fn.includes('high protein')) {
                        isRestricted = true;
                        matchedDisease = 'Chronic Kidney Disease (CKD)';
                    }
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    allowed: !isRestricted,
                    isRestricted: isRestricted,
                    foodName: foodName,
                    diseaseName: matchedDisease,
                    warning: isRestricted ? `⚠️ Food Not Allowed: ${foodName} is restricted for ${matchedDisease}.` : null
                }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (reqPath === '/' || reqPath === '') {
        reqPath = '/simulator.html'; // Default to phone simulator UI like in user's image!
    } else if (reqPath === '/phone' || reqPath === '/simulator') {
        reqPath = '/simulator.html';
    } else if (reqPath === '/desktop' || reqPath === '/full') {
        reqPath = '/index.html';
    }

    const filePath = path.join(PUBLIC_DIR, reqPath);

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback to simulator.html or index.html
            const fallbackPath = path.join(PUBLIC_DIR, 'simulator.html');
            fs.readFile(fallbackPath, (fallbackErr, content) => {
                if (fallbackErr) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(content);
                }
            });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

const localIp = getLocalIp();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`📱 Clinical Dietetics Phone Simulator & Mobile UI ready!`);
    console.log(`👉 Local Simulator:     http://localhost:${PORT}`);
    console.log(`👉 Phone Viewport:      http://localhost:${PORT}/simulator.html`);
    console.log(`👉 Desktop Dashboard:   http://localhost:${PORT}/desktop`);
    console.log(`🌐 Physical Phone Wifi: http://${localIp}:${PORT}`);
    console.log(`=======================================================`);
});

