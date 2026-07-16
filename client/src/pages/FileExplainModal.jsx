import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const FileExplainModal = ({ owner = '', repo = '', path = '', techStack = { stack: [], projectType: 'Web Application' }, onClose, fileCache = {}, setFileCache }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [interviewAnswers, setInterviewAnswers] = useState({});
    const [answerLoadingStates, setAnswerLoadingStates] = useState({});

    useEffect(() => {
        const fetchFileExplanation = async () => {
            if (!path) return;

            // Check cache first
            if (fileCache && fileCache[path]) {
                setFileData(fileCache[path]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // First, fetch the file content from GitHub
                console.log('Fetching file content from GitHub:', { owner, repo, path });
                
                const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (!githubResponse.ok) {
                    throw new Error(`Failed to fetch file from GitHub: ${githubResponse.statusText}`);
                }

                const githubData = await githubResponse.json();
                
                // Decode the content (GitHub API returns base64 encoded content)
                const content = atob(githubData.content);
                const fileName = path.split('/').pop(); // Extract filename from path

                console.log('File content fetched:', { fileName, contentLength: content.length });

                // Now call the explain-file API with the correct format
                const requestBody = {
                    fileName,
                    content,
                    techStack: techStack
                };
                console.log('File explanation request:', requestBody);
                
                const response = await API.post('/explain-file', requestBody);
                console.log('File explanation response:', response.data);
                
                // Handle the response format - backend returns { success: true, data: result }
                let data = response.data.data;
                
                // If data is a string, try to parse it as JSON
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (parseError) {
                        console.error('Failed to parse response data:', parseError);
                    }
                }
                
                setFileData(data);
                
                // Update cache if setFileCache function is provided
                if (setFileCache) {
                    setFileCache(prev => ({ ...prev, [path]: data }));
                }
            } catch (err) {
                console.error('Error fetching file explanation:', err);
                console.error('Error response:', err.response?.data);
                console.error('Error status:', err.response?.status);
                
                setError(err.response?.data?.message || err.message || 'Failed to fetch file explanation');
            } finally {
                setLoading(false);
            }
        };

        fetchFileExplanation();
    }, [path, owner, repo, techStack, fileCache, setFileCache]);

    const handleClose = () => {
        setFileData(null);
        setError(null);
        setInterviewAnswers({});
        onClose();
    };

    const handleGetInterviewAnswer = async (question, index) => {
        if (interviewAnswers[index]) return;

        setAnswerLoadingStates(prev => ({ ...prev, [index]: true }));

        try {
            const response = await API.post('/answer', { question, projectContext: `File: ${path}, Tech stack: ${techStack.stack.join(', ')}` });
            console.log('Interview answer response:', response.data);
            
            let answerText = '';
            if (typeof response.data.data === 'string') {
                try {
                    const parsedData = JSON.parse(response.data.data);
                    answerText = parsedData.answer || parsedData.response || response.data.data;
                } catch (parseError) {
                    answerText = response.data.data;
                }
            } else if (response.data.data?.answer) {
                answerText = response.data.data.answer;
            } else if (response.data.data?.response) {
                answerText = response.data.data.response;
            } else {
                answerText = JSON.stringify(response.data.data);
            }
            
            setInterviewAnswers(prev => ({ ...prev, [index]: answerText }));
        } catch (error) {
            console.error('Error fetching interview answer:', error);
            setInterviewAnswers(prev => ({ ...prev, [index]: 'Failed to fetch answer. Please try again.' }));
        } finally {
            setAnswerLoadingStates(prev => ({ ...prev, [index]: false }));
        }
    };

    if (!path) return null;

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-fraunces'>
            <div className='bg-background-secondary border border-dark rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-lg'>
                {/* Header */}
                <div className='flex justify-between items-start mb-6'>
                    <div>
                        <h2 className='text-xl font-bold text-dark'>File Explanation</h2>
                        <p className='text-sm text-gray mt-1'>{path}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className='text-dark hover:text-secondary transition-colors text-2xl font-bold leading-none'
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className='text-center py-12'>
                        <p className='text-gray font-medium'>Loading file explanation...</p>
                    </div>
                ) : error ? (
                    <div className='text-center py-12'>
                        <p className='text-red-600 font-medium'>{error}</p>
                        <p className='text-sm text-gray mt-2'>Please check the console for more details.</p>
                    </div>
                ) : fileData && (
                    <div className='space-y-6'>
                        {/* Purpose */}
                        {fileData.purpose && (
                            <div>
                                <h3 className='text-lg font-semibold text-dark mb-2'>Purpose</h3>
                                <p className='text-gray leading-relaxed'>{fileData.purpose}</p>
                            </div>
                        )}

                        {/* Key Concepts */}
                        {fileData.keyConcepts && fileData.keyConcepts.length > 0 && (
                            <div>
                                <h3 className='text-lg font-semibold text-dark mb-3'>Key Concepts</h3>
                                <div className='flex flex-wrap gap-2'>
                                    {fileData.keyConcepts.map((concept, index) => (
                                        <span
                                            key={index}
                                            className='px-3 py-1 bg-secondary text-white rounded-full text-sm font-medium'
                                        >
                                            {concept}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Connections */}
                        {fileData.connections && (
                            <div>
                                <h3 className='text-lg font-semibold text-dark mb-2'>Connections</h3>
                                <p className='text-gray leading-relaxed'>{fileData.connections}</p>
                            </div>
                        )}

                        {/* Interview Questions */}
                        {fileData.interviewQuestions && fileData.interviewQuestions.length > 0 && (
                            <div>
                                <h3 className='text-lg font-semibold text-dark mb-3'>Interview Questions</h3>
                                <ul className='space-y-3'>
                                    {fileData.interviewQuestions.map((question, index) => (
                                        <li key={index} className='flex items-start text-gray'>
                                            <span className='text-dark font-bold mr-2 mt-1'>{index + 1}.</span>
                                            <div className='flex-1'>
                                                <span>{question}</span>
                                                <button
                                                    onClick={() => handleGetInterviewAnswer(question, index)}
                                                    disabled={answerLoadingStates[index]}
                                                    className='ml-2 px-2 py-1 border border-dark text-dark rounded-md text-xs font-medium hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                                                >
                                                    {answerLoadingStates[index] ? 'Loading...' : interviewAnswers[index] ? 'View answer' : 'See answer'}
                                                </button>
                                                {interviewAnswers[index] && (
                                                    <div className='mt-2 p-2 bg-background-secondary rounded border border-dark/30'>
                                                        <p className='text-xs font-semibold text-dark mb-1'>Answer:</p>
                                                        <p className='text-xs text-gray leading-relaxed'>{interviewAnswers[index]}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Fallback if no data */}
                        {!fileData.purpose && !fileData.keyConcepts && !fileData.connections && !fileData.interviewQuestions && (
                            <div className='text-center py-8'>
                                <p className='text-gray'>No explanation data available for this file.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileExplainModal;