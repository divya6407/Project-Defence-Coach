import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const GITHUB_API = 'https://api.github.com';
const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};
export function parseRepoUrl(url) {
    const isfull = url.split(":");
    if (isfull[0] === "https") {
        const urlsplit = url.split(/\/+/);
        return { owner: urlsplit[urlsplit.length - 2], repo: urlsplit[urlsplit.length - 1] }
    }
    else {
        const urlsplit = url.split(/\/+/);
        return { owner: urlsplit[0], repo: urlsplit[1] }
    }
}

export async function fetchRepoTree(owner, repo) {
    const branchesToTry = ['main', 'master'];
    for (const branch of branchesToTry) {
        try {
            const response = await axios.get(
                `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}`,
                {
                    params: { recursive: 1 },
                    headers,
                }
            );

            return {
                branch,
                tree: response.data.tree,       // array of { path, mode, type, sha, size?, url }
                truncated: response.data.truncated,
            };
        } catch (error) {
            const status = error.response?.status;
            if (status === 404 && branch !== branchesToTry[branchesToTry.length - 1]) {
                continue;
            }
            if (status === 404) {
                throw new Error(`Repo ${owner}/${repo} not found, or has neither a main nor master branch`);
            }
            if (status === 403) {
                throw new Error('GitHub API rate limit exceeded. Try again later or add a GITHUB_TOKEN.');
            }
            throw new Error(`Failed to fetch repo tree for ${owner}/${repo}: ${error.message}`);
        }
    }
}


export async function fetchFileContent(owner, repo, path) {
    try {
        const response = await axios.get(
            `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
            { headers }
        );

        // If GitHub returns an array, `path` was actually a folder, not a file
        if (Array.isArray(response.data)) {
            throw new Error(`"${path}" is a directory, not a file`);
        }
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return {
            path,
            content,
            size: response.data.size,
            sha: response.data.sha,
        };
    } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
            throw new Error(`File "${path}" not found in ${owner}/${repo}`);
        }
        throw new Error(`Failed to fetch file content for "${path}": ${error.message}`);
    }
}


export async function fetchSpecificPackageJson(owner, repo, path) {
    try {
        const { content } = await fetchFileContent(owner, repo, path);
        return JSON.parse(content);
    } catch {
        return null; 
    }
}




export async function fetchReadme(owner,repo){
    const {tree} =await fetchRepoTree(owner,repo);
    const targetEntry = tree.find(entry=>{
        const fileName = entry.path.split('/').pop().toLowerCase();
        return fileName.startsWith('readme');}
    )
    if (!targetEntry) {
        return null;
    }
    const { content } = await fetchFileContent(owner, repo, targetEntry.path);
    return content;
}
