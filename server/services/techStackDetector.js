import { parseRepoUrl, fetchRepoTree, fetchFileContent, fetchReadme } from './githubService.js';

function extractDeps(pkgJson) {
    if (!pkgJson) return {};
    return {
        ...(pkgJson.dependencies || {}),
        ...(pkgJson.devDependencies || {})
    };
}


async function fetchJsonByPaths(owner, repo, tree, paths) {
    const target = tree.find(entry => paths.includes(entry.path));
    if (!target) return null;
    try {
        const { content } = await fetchFileContent(owner, repo, target.path);
        return JSON.parse(content);
    } catch {
        return null;
    }
}


async function fetchFrontendPackageJson(owner, repo, tree) {
    return await fetchJsonByPaths(owner, repo, tree, ['package.json', 'frontend/package.json', 'client/package.json']);
}


async function fetchBackendPackageJson(owner, repo, tree) {
    return await fetchJsonByPaths(owner, repo, tree, ['package.json', 'backend/package.json', 'server/package.json']);
}


export function detectFrontendJson(pkgJson) {
    if (!pkgJson) return { frontend: [], tools: [] };
    const allDeps = extractDeps(pkgJson);
    const detectedFrontend = [];
    const detectedTools = [];

    if (allDeps['next']) detectedFrontend.push('Next.js');
    else if (allDeps['react']) detectedFrontend.push('React');

    if (allDeps['tailwindcss']) detectedFrontend.push('Tailwind CSS');
    if (allDeps['zustand']) detectedFrontend.push('Zustand');
    if (allDeps['redux'] || allDeps['@reduxjs/toolkit']) detectedFrontend.push('Redux');
    if (allDeps['vite']) detectedTools.push('Vite');

    return { frontend: detectedFrontend, tools: detectedTools };
}


export function detectBackendJson(pkgJson) {
    if (!pkgJson) return { backend: [], tools: [] };
    const allDeps = extractDeps(pkgJson);
    const detectedBackend = [];
    const detectedTools = [];

    if (allDeps['express']) detectedBackend.push('Express');
    if (allDeps['mongoose']) detectedBackend.push('MongoDB (Mongoose)');
    if (allDeps['mysql'] || allDeps['mysql2']) detectedBackend.push('MySQL');
    if (allDeps['firebase'] || allDeps['firebase-admin']) detectedBackend.push('Firebase');
    if (allDeps['jsonwebtoken']) detectedBackend.push('JWT Auth');
    if (allDeps['socket.io'] || allDeps['socket.io-client']) detectedBackend.push('Socket.IO');

    if (allDeps['axios']) detectedTools.push('Axios');
    if (allDeps['nodemon']) detectedTools.push('Nodemon');
    if (allDeps['dotenv']) detectedTools.push('Dotenv');
    if (allDeps['multer']) detectedTools.push('Multer (File Uploads)');
    if (allDeps['bcrypt'] || allDeps['bcryptjs']) detectedTools.push('Bcrypt (Hashing)');

    return { backend: detectedBackend, tools: detectedTools };
}


export function detectFromFileTree(tree) {
    if (!tree || !Array.isArray(tree)) return [];

    const fallbackStack = [];
    const paths = tree.map(entry => entry.path || '');

    if (paths.some(p => p === 'requirements.txt' || p === 'Pipfile' || p.endsWith('.py'))) {
        fallbackStack.push('Python');
    }
    if (paths.some(p => p === 'pom.xml' || p === 'build.gradle' || p.endsWith('.java'))) {
        fallbackStack.push('Java');
    }
    if (paths.some(p => p === 'go.mod' || p.endsWith('.go'))) {
        fallbackStack.push('Go');
    }

    return fallbackStack;
}


export function detectProjectType(frontendList, backendList) {
    const hasFrontend = frontendList && frontendList.length > 0;
    const hasBackend = backendList && backendList.length > 0;

    if (hasFrontend && hasBackend) return "Full Stack";
    if (hasFrontend) return "Frontend";
    if (hasBackend) return "Backend";

    return "Unknown / Tooling Only";
}


export async function detectPackageJson(owner, repo, tree) {
    const [feJson, beJson] = await Promise.all([
        fetchFrontendPackageJson(owner, repo, tree),
        fetchBackendPackageJson(owner, repo, tree)
    ]);

    const feResult = detectFrontendJson(feJson);
    const beResult = detectBackendJson(beJson);

    return {
        frontend: feResult.frontend,
        backend: beResult.backend,
        tools: [...feResult.tools, ...beResult.tools]
    };
}

export async function detectTechStack(owner, repo) {
    const { tree } = await fetchRepoTree(owner, repo);

    const packageAnalysis = await detectPackageJson(owner, repo, tree);

    const frontendList = packageAnalysis.frontend;
    const backendList = packageAnalysis.backend;
    const toolsList = packageAnalysis.tools;

    if (frontendList.length === 0 && backendList.length === 0) {
        const fallbackStack = detectFromFileTree(tree);
        return {
            stack: fallbackStack,
            stackWise: { frontend: [], backend: [], tools: [] },
            projectType: fallbackStack.length > 0 ? "Backend" : "Unknown / Tooling Only"
        };
    }

    const finalStack = Array.from(new Set([...frontendList, ...backendList, ...toolsList]));
    const stackWise = { frontend: frontendList, backend: backendList, tools: toolsList }
    const projectType = detectProjectType(frontendList, backendList);

    return {
        stack: finalStack,
        stackWise,
        projectType
    };
}
