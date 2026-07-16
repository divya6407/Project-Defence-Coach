import { featureDetectionPrompt } from '../services/geminiService.js';

export async function getFeatures(req, res) {
    try {
        const { techStack, readme, dependencies, additionalDocs, fileTreeSummary } = req.body;

        const result = await featureDetectionPrompt({ techStack, readme, dependencies, additionalDocs, fileTreeSummary });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error detecting features:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}