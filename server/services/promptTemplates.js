/**
 * All Gemini prompt strings live here, separate from the API-calling code.
 * Every prompt asks for JSON-only output so geminiService.js can parse it consistently.
 */

// ---------- Shared helpers ----------

/**
 * Converts a raw GitHub tree array into a compact, indented string
 * so we don't blow up the prompt with huge JSON blobs.
 * Caps the number of entries to keep token usage low.
 */
// file:///C:/Users/Admin/Desktop/internship/project_defense_coach/server/services/promptTemplates.js

export function summarizeFileTree(treeInput, maxEntries = 150) {
    // 1. Safe check: Extract the array if an object containing a 'tree' property was passed
    let tree = treeInput;
    if (treeInput && typeof treeInput === 'object' && !Array.isArray(treeInput)) {
        tree = treeInput.tree || treeInput.data || [];
    }

    // 2. Fallback: If it's still not an array, convert it to an empty array to prevent crashing
    if (!Array.isArray(tree)) {
        tree = [];
    }

    const limited = tree.slice(0, maxEntries);
    const lines = limited.map((item) => {
        const marker = item.type === 'tree' ? '[dir]' : '[file]';
        return `${marker} ${item.path || item.name || 'unknown'}`;
    });

    const suffix =
        tree.length > maxEntries
            ? `\n...and ${tree.length - maxEntries} more files/folders (truncated for brevity)`
            : '';

    return lines.join('\n') + suffix;
}


/**
 * Trims very long file contents before sending to Gemini,
 * to avoid hitting token limits on huge files.
 */
export function truncateContent(content, maxChars = 6000) {
    if (content.length <= maxChars) return content;
    return (
        content.slice(0, maxChars) +
        `\n\n... (truncated, file is ${content.length} characters total)`
    );
}

/**
 * Finds markdown files in the tree that are likely to contain real feature
 * documentation but aren't the root README — e.g. files in commands/, docs/,
 * .claude/commands/, or similar. Many CLI/agent tools document each command
 * or feature as its own .md file rather than describing everything in one README.
 */
/**
 * Finds markdown files in the tree that are likely to contain real feature
 * documentation but aren't the root README — e.g. files in commands/, docs/,
 * .claude/commands/, .claude/skills/, or similar. Many CLI/agent tools document
 * each command or feature as its own .md file rather than describing everything
 * in one README.
 */
export function findAdditionalDocFiles(tree, maxFiles = 10) {
    const docFolderPattern = /(^|\/)(docs|commands|\.claude|guides|skills)(\/|$)/i;

    const candidates = tree.filter((item) => {
        if (item.type !== 'blob') return false;
        if (!item.path.endsWith('.md') && !item.path.endsWith('.mdx')) return false;
        if (/^readme\.md$/i.test(item.path)) return false; // README handled separately
        return docFolderPattern.test(item.path) || item.path.split('/').length <= 2;
        // ^ also allow shallow top-level .md files even outside a docs/commands folder
    });

    // Favor substantive files over tiny stubs — sort LARGEST first, not smallest.
    // A command doc describing a whole workflow (e.g. apply.md) usually has more
    // real signal than a short one (e.g. reset.md), so we want it included first
    // if we hit the maxFiles cap.
    candidates.sort((a, b) => (b.size || 0) - (a.size || 0));

    return candidates.slice(0, maxFiles).map((item) => item.path);
}

/**
 * Fetches and concatenates additional doc files found by findAdditionalDocFiles.
 * Caps total combined length so we don't blow the prompt's token budget.
 * Pass in your existing fetchFileContent function from githubService.js.
 */
export async function fetchAdditionalDocs(owner, repo, tree, fetchFileContent, maxTotalChars = 20000) {
    const paths = findAdditionalDocFiles(tree);
    let combined = '';

    for (const path of paths) {
        if (combined.length >= maxTotalChars) break;
        try {
            const { content } = await fetchFileContent(owner, repo, path);
            combined += `\n\n--- ${path} ---\n${content}`;
        } catch {
            // skip files that fail to fetch (rate limit, odd encoding, etc.) — don't crash the whole analysis
        }
    }

    return combined.slice(0, maxTotalChars);
}

// A short instruction appended to every prompt to keep parsing reliable
const JSON_ONLY_INSTRUCTION = `
Respond with ONLY valid JSON. No markdown code fences, no backticks, no explanation text before or after the JSON.
`;

// ---------- 1. Project Summary ----------

export function summaryPrompt({ readme, techStack, projectType, fileTreeSummary }) {
    return `
You are helping a developer prepare to confidently explain their own project in a job interview.

Project type: ${projectType || 'Unknown'}
Detected tech stack: ${techStack.join(', ') || 'Unknown'}

README content:
${readme || '(no README found)'}

Key files/folders in the project:
${fileTreeSummary}

Write two summaries the developer can say out loud in an interview:
1. "shortSummary": a 30-second spoken explanation (2-3 sentences, confident and natural, not robotic)
2. "detailedSummary": a 2-minute explanation covering the project's purpose, why the tech stack was chosen, and the main features

Return JSON in exactly this shape:
{
  "shortSummary": "...",
  "detailedSummary": "..."
}
${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------- 2. Feature Detection ----------

export function featureDetectionPrompt({ fileTreeSummary, techStack, readme, dependencies, additionalDocs }) {
    const depList = dependencies && dependencies.length ? dependencies.join(', ') : 'Unknown';

    return `
You are analyzing a codebase to identify which real features it implements, based on its documentation, file/folder names, raw dependencies, and tech stack.

Tech stack (simplified): ${techStack.join(', ') || 'Unknown'}
Raw dependencies from package.json: ${depList}

README content:
${readme || '(no README found)'}

Additional documentation found in the repo (command docs, docs/ folder files, etc. — this is often where the REAL feature list lives, especially for CLI tools or agent-based projects where each command/feature has its own doc file):
${additionalDocs || '(none found)'}

Files and folders:
${fileTreeSummary}

Identify the ACTUAL features of this specific project. Two common project shapes to watch for:

1. Web apps: check carefully for Authentication, CRUD Operations, File Uploads, Payments, Real-time Chat, Notifications (email/push/SMS), Search/Filtering, Role-Based Access — these often live inside a generic controller/route file (e.g. a query parameter or an if-statement checking a "role" field) rather than their own folder, so use README + dependencies as hints even without an obvious filename match.

2. CLI tools / agent-based projects: features are often defined as individual commands or workflows, each documented in its own file (e.g. a "commands/" or "docs/" folder). If the additional documentation above describes commands like "/apply" or "/scrape", extract each distinct command/workflow as its own feature with a clear, specific label (e.g. "Automated Application Pipeline", "Multi-Portal Job Scraping", "Skill Gap Analysis") rather than lumping them into a vague label like "API Integration". Prefer the more specific, descriptive label over a generic one whenever the docs give you enough detail to be specific.

For anything else (data/AI/scripts with no command structure), use whichever labels genuinely fit, e.g. "Web Scraping", "LLM/AI Integration", "Data Pipeline".

Only include features you find real evidence for — do not guess wildly, but do connect the dots between README description, dependencies, and file structure rather than requiring an exact filename match.

Return JSON in exactly this shape:
{
  "features": ["Authentication", "CRUD Operations", "Search/Filtering", "Role-Based Access"]
}
${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------- 3. Architecture Explanation ----------

export function architecturePrompt({ techStack, projectType, fileTreeSummary }) {
    return `
You are explaining a project's architecture to a developer so they can confidently describe it in an interview.

Project type: ${projectType || 'Unknown'}
Tech stack: ${techStack.join(', ') || 'Unknown'}

Files and folders:
${fileTreeSummary}

Produce:
1. "diagram": a simple text-based layered diagram of the architecture, using arrows, e.g.:
"React Frontend\\n   ↓\\nExpress API\\n   ↓\\nMongoDB"
2. "explanation": 3-4 plain-language sentences describing how a request flows through the system, from user action to response

Return JSON in exactly this shape:
{
  "diagram": "...",
  "explanation": "..."
}
${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------- 4. Interview Questions ----------

export function interviewQuestionsPrompt({ techStack, features, architectureExplanation }) {
    return `
You are an experienced software engineer conducting a technical interview for a student or fresher.

Project Information:
- Tech Stack: ${techStack.join(', ') || 'Unknown'}
- Features: ${features.join(', ') || 'None detected'}
- Architecture: ${architectureExplanation || 'Not available'}

Your task is to generate 6-8 interview questions that are SPECIFIC to this project.

Rules:
1. Questions MUST be based only on the provided tech stack, features, and architecture.
2. Do NOT ask generic interview questions.
3. Ask ONLY ONE concept per question.
4. Keep questions clear, concise, and conversational.
5. Start with easier questions and gradually increase the difficulty.
6. If Authentication exists, include 1-2 authentication questions.
7. If CRUD exists, include at least 1 CRUD/data flow question.
8. If File Upload exists, include 1 file upload question.
9. If Real-time Chat exists, include 1 Socket.IO/WebSocket question.
10. If Payments exist, include 1 payment-related question.
11. Do NOT mention technologies that are not present in the project.
12. Avoid combining multiple topics into one question.

Group the questions in this order whenever applicable:
- Project Overview
- Technology Choices
- Authentication
- Database
- API Design
- Feature-specific Questions
- Scalability / Improvements

Return ONLY valid JSON in exactly this format:

{
  "questions": [
    {
      "topic": "Project Overview",
      "difficulty": "Easy",
      "question": "Can you briefly explain what this project does?"
    },
    {
      "topic": "Authentication",
      "difficulty": "Medium",
      "question": "Why did you choose JWT for authentication?"
    }
  ]
}

${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------- 5. Follow-Up Questions ----------

export function followUpPrompt({ question, projectContext }) {
    return `
You are a technical interviewer digging deeper into a candidate's answer, the way a real interviewer probes for depth.

Project context: ${projectContext || 'Not available'}

The candidate was just asked:
"${question}"

Generate a chain of 2-3 progressively deeper follow-up questions an interviewer would ask next, based on how a well-prepared candidate might answer. Each should go one level deeper than the last (e.g. from "why X" to "how is X implemented" to "what happens when X fails").

Return JSON in exactly this shape:
{
  "chain": [
    "How is JWT verified on the server?",
    "What happens when the token expires?",
    "How would you implement token refresh?"
  ]
}
${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------- 6. Explain This File ----------

export function explainFilePrompt({ fileName, fileContent, techStack }) {
    return `
You are explaining a single source code file to a developer so they can confidently discuss it in a technical interview.

Tech stack context: ${techStack.join(', ') || 'Unknown'}
File name: ${fileName}

File content:
${truncateContent(fileContent)}

Produce:
1. "purpose": 1-2 sentences on what this file does and why it exists
2. "keyConcepts": a list of important libraries, patterns, or techniques used in this file (e.g. "React Hooks", "JWT verification middleware")
3. "connections": 1-2 sentences on how this file connects to the rest of the app (e.g. API endpoints it calls, components it renders, models it imports)
4. "interviewQuestions": 2-3 questions an interviewer might ask specifically about this file

Return JSON in exactly this shape:
{
  "purpose": "...",
  "keyConcepts": ["...", "..."],
  "connections": "...",
  "interviewQuestions": ["...", "..."]
}
${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------- 7. Answer Question ----------

export function answerPrompt({ question, projectContext }) {
    return `
You are an experienced software engineer helping a developer prepare for a technical interview about their own project.

Project context: ${projectContext || 'Not available'}

The interviewer asked:
"${question}"

Provide a clear, confident, and natural-sounding answer that the developer could give in an interview. The answer should:
1. Be 2-4 sentences long (not too short, not too long)
2. Show understanding of the project's implementation
3. Be conversational and natural (not robotic)
4. Include specific details from the project context when relevant
5. If the question is about a trade-off or design decision, explain the reasoning

Return JSON in exactly this shape:
{
  "answer": "Your well-crafted answer here..."
}
${JSON_ONLY_INSTRUCTION}
`.trim();
}