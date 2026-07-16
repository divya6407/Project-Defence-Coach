import { interviewQuestionsPrompt } from '../services/geminiService.js';

export async function getQuestions(req, res) {
    try {
        const { techStack, features, architecture } = req.body;

        if (!techStack) {
            return res.status(400).json({ error: "Missing required field: techStack" });
        }

        const result = await interviewQuestionsPrompt({ techStack, features, architecture });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error generating interview questions:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}