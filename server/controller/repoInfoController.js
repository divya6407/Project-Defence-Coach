import { parseRepoUrl, fetchRepoTree, fetchReadme, fetchFileContent, fetchSpecificPackageJson } from '../services/githubService.js';
import { detectTechStack } from '../services/techStackDetector.js';
import { summarizeFileTree, truncateContent, fetchAdditionalDocs } from '../services/promptTemplates.js';

export async function getRepoInfo(req, res) {
    try {
        const repoURL = req.body.repoUrl || req.body.repoURL;
        if (!repoURL) {
            return res.status(400).json({ error: "repoUrl is required" });
        }

        // 1. Parse GitHub URL
        const { owner, repo } = parseRepoUrl(repoURL);
        if (!owner || !repo) {
            return res.status(400).json({ error: "Invalid GitHub URL format." });
        }

        // 2. Fetch repo tree
        const treeResult = await fetchRepoTree(owner, repo);
        const fileTree = treeResult.tree;
        const fileTreeSummary = summarizeFileTree(fileTree);

        // 3. Fetch README
        const rawReadme = await fetchReadme(owner, repo);
        const readme = truncateContent(rawReadme || '');

        // 4. Detect tech stack
        const techStackResult = await detectTechStack(owner, repo);
        const techStack = techStackResult.stack;
        const stackWise = techStackResult.stackWise;
        const projectType = techStackResult.projectType;

        // 5. Fetch dependencies from package.json (try root, client/, server/, frontend/, backend/)
        const packagePaths = ['package.json', 'client/package.json', 'server/package.json', 'frontend/package.json', 'backend/package.json'];
        const allDeps = new Set();
        for (const pkgPath of packagePaths) {
            try {
                const pkg = await fetchSpecificPackageJson(owner, repo, pkgPath);
                if (pkg && pkg.dependencies) {
                    Object.keys(pkg.dependencies).forEach(d => allDeps.add(d));
                }
            } catch {
                // skip — try next path
            }
        }
        const dependencies = Array.from(allDeps);

        // 6. Fetch additional docs
        const additionalDocs = await fetchAdditionalDocs(owner, repo, fileTree, fetchFileContent);

        // 7. Return everything — no Gemini calls
        return res.status(200).json({
            success: true,
            owner,
            repo,
            techStack,
            stackWise,
            projectType,
            fileTree,
            fileTreeSummary,
            readme,
            dependencies,
            additionalDocs,
        });

    } catch (error) {
        console.error('❌ Error fetching repo info:', error);
        return res.status(500).json({
            success: false,
            error: 'An internal error occurred while processing the repository.',
            details: error.message,
        });
    }
}