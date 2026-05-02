const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 80;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/' && req.method === 'GET') {
        const filePath = path.join(__dirname, 'index.html');
        const owoFilePath = path.join(__dirname, 'owo.txt');
        
        fs.readFile(owoFilePath, 'utf-8', (err, owoContent) => {
            if (err) {
                owoContent = '';
            }
            
            fs.readFile(filePath, 'utf-8', (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                } else {
                    const lines = owoContent.trim().split('\n').filter(line => line);
                    const listItems = lines.map(line => `<p>${line}</p>`).join('\n');
                    const html = content.replace('<!-- OWO_CONTENT -->', listItems || '<p>暂无内容</p>');
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(html, 'utf-8');
                }
            });
        });
    } else if (parsedUrl.pathname === '/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const owo = params.get('owo');
            if (owo) {
                fs.appendFile(path.join(__dirname, 'owo.txt'), owo + '\n', (err) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Failed to save');
                    } else {
                        res.writeHead(302, { 'Location': '/' });
                        res.end();
                    }
                });
            } else {
                res.writeHead(400);
                res.end('Bad Request');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
