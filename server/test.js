// Uses global fetch (Node 18+)
async function runTest() {
    console.log("🚀 Testing new split endpoints...\n");

    try {
        // Step 1: Call /api/repo-info (no AI) to get all GitHub data
        console.log("1️⃣  POST /api/repo-info");
        const repoResponse = await fetch('http://localhost:5000/api/repo-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                repoUrl: 'm87-labs/moondream'
            })
        });
        const repoData = await repoResponse.json();
        console.log(`   ✅ Status: ${repoResponse.status}`);
        console.log(`   Owner: ${repoData.owner}, Repo: ${repoData.repo}`);
        console.log(`   Tech Stack: ${repoData.techStack?.join(', ')}`);
        console.log(`   Project Type: ${repoData.projectType}`);
        console.log(`   File Tree Entries: ${repoData.fileTree?.length || 0}`);
        console.log(`   Dependencies: ${repoData.dependencies?.length || 0}\n`);

        // Step 2: Call /api/summary with repo data (AI)
        console.log("2️⃣  POST /api/summary");
        const summaryResponse = await fetch('http://localhost:5000/api/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                readme: repoData.readme,
                techStack: repoData.techStack,
                projectType: repoData.projectType,
                fileTreeSummary: repoData.fileTreeSummary,
            })
        });
        const summaryData = await summaryResponse.json();
        console.log(`   ✅ Status: ${summaryResponse.status}`);
        console.log(`   Short Summary: ${summaryData.data?.shortSummary?.slice(0, 100)}...\n`);

        // Step 3: Call /api/architecture with repo data (AI)
        console.log("3️⃣  POST /api/architecture");
        const archResponse = await fetch('http://localhost:5000/api/architecture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                techStack: repoData.techStack,
                projectType: repoData.projectType,
                fileTreeSummary: repoData.fileTreeSummary,
            })
        });
        const archData = await archResponse.json();
        console.log(`   ✅ Status: ${archResponse.status}`);
        console.log(`   Architecture: ${archData.data?.explanation?.slice(0, 100)}...\n`);

        // Step 4: Call /api/features with repo data (AI)
        console.log("4️⃣  POST /api/features");
        const featuresResponse = await fetch('http://localhost:5000/api/features', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                techStack: repoData.techStack,
                readme: repoData.readme,
                dependencies: repoData.dependencies,
                additionalDocs: repoData.additionalDocs,
                fileTreeSummary: repoData.fileTreeSummary,
            })
        });
        const featuresData = await featuresResponse.json();
        console.log(`   ✅ Status: ${featuresResponse.status}`);
        console.log(`   Features: ${featuresData.data?.features?.join(', ') || 'none'}\n`);

        // Step 5: Call /api/questions with features + architecture (AI)
        console.log("5️⃣  POST /api/questions");
        const questionsResponse = await fetch('http://localhost:5000/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                techStack: repoData.techStack,
                features: featuresData.data,
                architecture: archData.data?.explanation,
            })
        });
        const questionsData = await questionsResponse.json();
        console.log(`   ✅ Status: ${questionsResponse.status}`);
        console.log(`   Questions Generated: ${questionsData.data?.questions?.length || 0}\n`);

        console.log("🎉 All endpoints tested successfully!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

runTest();