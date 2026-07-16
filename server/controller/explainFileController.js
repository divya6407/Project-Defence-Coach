import { explainFilePrompt } from '../services/geminiService.js';

export async function getExplainFile(req, res) {
    try {
        const { fileName, content, techStack } = req.body;

        if (!fileName || !content || !techStack) {
            return res.status(400).json({ error: "Missing required fields: fileName, content, techStack" });
        }

        const result = await explainFilePrompt(fileName, content, techStack);

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error explaining file:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}