import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exit } from 'process';

// Resolve the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userAgentsDir = path.join(__dirname, 'user_agents');

// Create the user_agents directory if it doesn't exist
if (!fs.existsSync(userAgentsDir)) {
    fs.mkdirSync(userAgentsDir);
}

// Function to download a file with retry logic and status prompts
async function downloadFile(url, filePath, method = 'GET', data = null, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt}: Downloading from ${url}`);
            const response = await axios({
                url: url,
                method: method,
                data: data,
                responseType: 'stream',
            });

            if (response.status === 200) {
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                console.log(`Successfully downloaded ${filePath}`);
                return;
            } else {
                const errorMessage = `Failed to download file. Status code: ${response.status}`;
                console.error(errorMessage);
                const errorData = await response.data.text();
                console.error(errorData);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt === retries) {
                console.error(`Failed to download ${filePath} after ${retries} attempts`);
                exit(1);
            }
            console.log('Retrying...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
        }
    }
}

export async function updateCrawlerUserAgents() {
    await downloadFile(
        'https://raw.githubusercontent.com/monperrus/crawler-user-agents/master/crawler-user-agents.json',
        path.join(userAgentsDir, 'crawler-user-agents.json')
    );
}

export async function updateBotUserAgents() {
    await downloadFile(
        'https://user-agents.net/download',
        path.join(userAgentsDir, 'user-agents-bots.txt'),
        'POST',
        'crawler=true&download=txt'
    );
}

// Ensure the script runs only when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        await updateCrawlerUserAgents();
        await updateBotUserAgents();
    })();
}
