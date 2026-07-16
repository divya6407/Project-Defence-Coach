import { followUpPrompt } from '../services/geminiService.js';

export async function getFollowUp(req, res) {
    try {
        const { question, projectContext } = req.body;

        if (!question) {
            return res.status(400).json({ error: "Missing required field: question" });
        }

        const result = await followUpPrompt(question, projectContext);

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error generating follow-up questions:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}