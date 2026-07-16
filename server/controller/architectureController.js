import { architecturePrompt } from '../services/geminiService.js';

export async function getArchitecture(req, res) {
    try {
        const { techStack, projectType, fileTreeSummary } = req.body;

        if (!techStack || !projectType || !fileTreeSummary) {
            return res.status(400).json({ error: "Missing required fields: techStack, projectType, fileTreeSummary" });
        }

        const result = await architecturePrompt({ techStack, projectType, fileTreeSummary });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error generating architecture:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}