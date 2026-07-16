import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import API from '../../api/axios';
import { Box } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SummaryCard from './SummaryCard.jsx';
import TechStackCard from './TechStackCard.jsx'
import ArchitectureView from './ArchitectureView.jsx';
import QuestionList from './QuestionList.jsx';
import FileExplorer from './FileExplorer.jsx';
import FileExplainModal from './FileExplainModal.jsx';
import CheatSheet from './CheatSheet.jsx';

import CachedIcon from '@mui/icons-material/Cached';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const repoinfo = location?.state?.repoInfo || location?.state || {};
    const [shortSummary, setshortSummary] = useState("");
    const [detailedSummary, setdetailedSummary] = useState("");
    const [features, setfeatures] = useState([]);
    const [questions, setquestions] = useState([]);
    const [architecture, setarchitecture] = useState({ diagram: '', explanation: '' });
    const [loading, setloading] = useState(false);
    const [error, seterror] = useState("");
    const [tabValue, setTabValue] = useState('summary');
    
    // File explorer state
    const [selectedFilePath, setSelectedFilePath] = useState(null);
    const [fileCache, setFileCache] = useState({});

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const fetchData = async () => {
        if (!repoinfo.owner || !repoinfo.repo) return;
        //readme, techStack, projectType, fileTreeSummary
        //{ shortSummary: '', detailedSummary: '' }
        //{ techStack, readme, dependencies, additionalDocs, fileTreeSummary }
        setloading(true);
        seterror("");
        try {
            const summarybody = { readme: repoinfo.readme, techStack: repoinfo.techStack, projectType: repoinfo.projectType, fileTreeSummary: repoinfo.fileTreeSummary }
            const data = await API.post('/summary', summarybody);
            console.log('loading');
            setshortSummary(data?.data?.data?.shortSummary);
            setdetailedSummary(data?.data?.data?.detailedSummary);
            console.log(data);
            const featuresbody = { techStack: repoinfo.techStack, readme: repoinfo.readme, dependencies: repoinfo.dependencies, additionalDocs: repoinfo.additionalDocs, fileTreeSummary: repoinfo.fileTreeSummary };
            const featuredata = await API.post('/features', featuresbody);
            console.log("loading features...");
            setfeatures(featuredata.data.data.features);
            console.log(featuredata.data.data.features);
            
            // Fetch questions
            try {
                const questionsbody = { techStack: repoinfo.techStack, readme: repoinfo.readme, fileTreeSummary: repoinfo.fileTreeSummary };
                const questionsdata = await API.post('/questions', questionsbody);
                setquestions(questionsdata.data.data.questions || []);
            } catch (err) {
                console.error('Failed to fetch questions:', err);
                setquestions([]);
            }
            
            // Fetch architecture (this might already be fetched in ArchitectureView, but we'll cache it here too)
            try {
                const archbody = { techStack: repoinfo.techStack, fileTreeSummary: repoinfo.fileTreeSummary, projectType: repoinfo.projectType };
                const archdata = await API.post('/architecture', archbody);
                setarchitecture(archdata.data.data || { diagram: '', explanation: '' });
            } catch (err) {
                console.error('Failed to fetch architecture:', err);
                setarchitecture({ diagram: '', explanation: '' });
            }
        }
        catch (err) {
            seterror(err.response?.data?.message || err.message || "Failed to fetch summary")
        }
        finally {
            setloading(false)
        }
    };

    const handleReanalyze = () => {
        // Trigger a re-fetch of all data by forcing component remount
        window.location.reload();
    };

    useEffect(() => {
        fetchData();
    }, [location]);

    const handleFileClick = (path) => {
        setSelectedFilePath(path);
    };

    const handleCloseModal = () => {
        setSelectedFilePath(null);
    };

    // Generate project context for follow-up questions
    const projectContext = `${detailedSummary} Tech stack: ${repoinfo.techStack?.join(', ') || 'N/A'}. Features: ${features?.join(', ') || 'N/A'}.`;
    
    // Get techStack for file explanation - use stackWise if available, otherwise use techStack
    const getTechStackForFiles = () => {
        let stackArray = [];
        if (repoinfo.stackWise) {
            stackArray = [
                ...(repoinfo.stackWise.frontend || []),
                ...(repoinfo.stackWise.backend || []),
                ...(repoinfo.stackWise.tools || [])
            ];
        }
        if (stackArray.length === 0 && repoinfo.techStack) {
            stackArray = repoinfo.techStack;
        }
        
        // Return in the format expected by backend: { stack: [...], projectType: ... }
        return {
            stack: stackArray,
            projectType: repoinfo.projectType || 'Web Application'
        };
    };

    return (
        <div className='bg-background-secondary font-fraunces w-screen min-h-screen m-0 p-0 overflow-x-hidden flex flex-col justify-between pb-12'>
            <div className='m-4'>
                {/*HEADER*/}
                <div className='flex justify-between items-center'>
                    <div>
                        <p className='text-dark text-xl font-semibold'>Project Defence Coach</p>
                        <p className='font-bold mt-4 '>Repository: <span className='text-secondary'>{repoinfo.owner}/{repoinfo.repo}</span></p>
                    </div>
                    <button onClick={handleReanalyze} className='border border-dark border-2 p-2 text-dark font-bold rounded-md hover:bg-background-secondary transition-colors'><CachedIcon sx={{ fontSize: 20, mr: 2, color: '#bd421f' }} />Re-analyze</button>
                </div>


                {/*TABS*/}

                <Box sx={{ width: '100%', mt: 4 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        textColor="#bd421f"
                        indicatorColor="secondary"
                        aria-label="dashboard tabs"
                        sx={{
                            '& .MuiTabs-indicator': { backgroundColor: '#bd421f' },
                            '& .MuiTab-root': { color: 'text.secondary', fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
                            '& .Mui-selected': { color: '#bd421f' }
                        }}
                    >
                        <Tab value="summary" label="Summary" />
                        {repoinfo.stackWise && (repoinfo.stackWise.frontend.length > 0 || repoinfo.stackWise.backend.length > 0 || repoinfo.stackWise.tools.length > 0) && <Tab value="techstack" label="Tech Stack" />}
                        <Tab value="architecture" label="Architecture" />
                        <Tab value="question" label="Question" />
                        <Tab value="files" label="Files" />
                        <Tab value="cheatsheet" label="Cheat Sheet" />
                    </Tabs>

                    {/* Tab Panels */}
                    {tabValue === 'summary' && <SummaryCard repoinfo={repoinfo} shortSummary={shortSummary} detailedSummary={detailedSummary} features={features} />}

                    {tabValue === 'techstack' && repoinfo.stackWise.frontend.length > 0 && repoinfo.stackWise.backend.length > 0 && repoinfo.stackWise.tools.length > 0 && < TechStackCard repoinfo={repoinfo} />}
                    {/* ... etc */}
                    {tabValue === 'architecture' && <ArchitectureView repoinfo={repoinfo} />}

                    {tabValue === 'question' && <QuestionList questions={questions} projectContext={projectContext} repoinfo={repoinfo} />}
                    
                    {tabValue === 'files' && (
                        <FileExplorer 
                            fileTree={repoinfo.fileTree || []} 
                            onFileClick={handleFileClick} 
                        />
                    )}
                    
                    {tabValue === 'cheatsheet' && <CheatSheet summary={{ shortSummary, detailedSummary }} techStack={repoinfo.techStack || []} features={features} architecture={architecture} questions={questions} />}
                </Box>

            </div>
            
            {/* File Explanation Modal */}
            {selectedFilePath && (
                <FileExplainModal 
                    owner={repoinfo.owner}
                    repo={repoinfo.repo}
                    path={selectedFilePath}
                    techStack={getTechStackForFiles()}
                    onClose={handleCloseModal}
                    fileCache={fileCache}
                    setFileCache={setFileCache}
                />
            )}
        </div>

    )
}

export default Dashboard