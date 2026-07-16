import { GoogleGenAI } from '@google/genai';
import { summaryPrompt as summaryPromptTemplate, truncateContent, 
    featureDetectionPrompt as featureDetectionPromptTemplate, 
    architecturePrompt as architecturePromptTemplate, interviewQuestionsPrompt as interviewQuestionsPromptTemplate, 
    followUpPrompt as followUpPromptTemplate, explainFilePrompt as explainFilePromptTemplate,
    answerPrompt as answerPromptTemplate
} from './promptTemplates.js'
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ask_gemini = async (prompt) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt
    });

    const output = response.text;
    if (!output) {
        throw new Error("Gemini returned empty response");
    }
    return output;
}

/**
 * Extracts JSON from a Gemini response.
 * Gemini sometimes wraps JSON in ```json ... ``` fences or adds extra text.
 * This strips those fences and tries to parse the first JSON block found.
 */
function extractJSON(text) {
    // Try to find a JSON block inside markdown fences first
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = fenceMatch ? fenceMatch[1].trim() : text.trim();
    return JSON.parse(jsonStr);
}

export async function summaryPrompt({ readme, techStack, projectType, fileTreeSummary }) {
    const arg={ readme, techStack, projectType, fileTreeSummary };
    const prompt = summaryPromptTemplate(arg);
    const response = await ask_gemini(prompt);
    try { return extractJSON(response); }
    catch { return { shortSummary: '', detailedSummary: '' }; }
}

export async function featureDetectionPrompt({ techStack, readme, dependencies, additionalDocs, fileTreeSummary }) {
    const prompt = featureDetectionPromptTemplate({
        fileTreeSummary,
        techStack,
        readme,
        dependencies,
        additionalDocs,
    });
    const response = await ask_gemini(prompt);
    try { return extractJSON(response); }
    catch { return { features: [] }; }
}


export async function architecturePrompt({ techStack, projectType, fileTreeSummary }) {
    const arg = { techStack, projectType, fileTreeSummary };
    const prompt = architecturePromptTemplate(arg);
    const response = await ask_gemini(prompt);
    try { return extractJSON(response); }
    catch { return { diagram: '', explanation: '' }; }
}


export async function interviewQuestionsPrompt({ techStack, features, architecture }) {
    // Extract features array: supports raw JSON string, parsed object { features: [...] }, or direct array
    let featuresList = [];
    if (typeof features === 'string') {
        try { featuresList = extractJSON(features).features || []; }
        catch { featuresList = []; }
    } else if (Array.isArray(features)) {
        featuresList = features;
    } else if (features && Array.isArray(features.features)) {
        featuresList = features.features;
    }
    const arg = { techStack, features: featuresList, architectureExplanation: architecture };
    const prompt = interviewQuestionsPromptTemplate(arg);
    const response = await ask_gemini(prompt);
    try { return extractJSON(response); }
    catch { return { questions: [] }; }
}


export async function followUpPrompt(question, projectContext) {
    const arg={question,projectContext};
    const prompt = followUpPromptTemplate(arg);
    const response = await ask_gemini(prompt);
    return response;
}


export async function explainFilePrompt(fileName, Content, techStack) {
    const {stack,projectType} = techStack;
    const fileContent = truncateContent(Content);
    const arg = {fileName,fileContent,techStack:stack};
    const prompt = explainFilePromptTemplate(arg);
    const response = await ask_gemini(prompt);
    return response;
}


export async function answerPrompt(question, projectContext) {
    const arg = {question, projectContext};
    const prompt = answerPromptTemplate(arg);
    const response = await ask_gemini(prompt);
    return response;
}