import { summaryPrompt } from '../services/geminiService.js';

export async function getSummary(req, res) {
    try {
        const { readme, techStack, projectType, fileTreeSummary } = req.body;

        if (!readme || !techStack || !projectType || !fileTreeSummary) {
            return res.status(400).json({ error: "Missing required fields: readme, techStack, projectType, fileTreeSummary" });
        }

        const result = await summaryPrompt({ readme, techStack, projectType, fileTreeSummary });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error generating summary:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}