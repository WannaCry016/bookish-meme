import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadBotUserAgents() {
    const crawlerFilePath = path.join(__dirname, 'user_agents', 'crawler-user-agents.json');
    const genericBotFilePath = path.join(__dirname, 'user_agents', 'user-agents-bots.txt');

    const crawlerData = await fs.readFile(crawlerFilePath, 'utf8');
    const genericBotData = await fs.readFile(genericBotFilePath, 'utf8');

    const crawlerAgents = new Set(JSON.parse(crawlerData).map(agent => agent.pattern.toLowerCase()));
    const genericBotAgents = new Set(genericBotData.split('\n').map(agent => agent.trim().toLowerCase()).filter(Boolean));

    return { crawlerAgents, genericBotAgents };
}

// Function to determine the bot kind
export async function determineBotKind(userAgent) {
    const { crawlerAgents, genericBotAgents } = await loadBotUserAgents();

    if (crawlerAgents.has(userAgent.toLowerCase())) {
        return {
            isBot: true,
            botKind: "Crawler"
        };
    } else if (genericBotAgents.has(userAgent.toLowerCase())) {
        return {
            isBot: true,
            botKind: "Genericbot"
        };
    }

    return {
        isBot: false,
        botKind: "NotABot"
    };
}
