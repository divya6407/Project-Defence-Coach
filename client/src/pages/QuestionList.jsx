import React, { useState, useEffect } from 'react'
import API from '../../api/axios';
import FollowUpChain from './FollowUpChain';

const QuestionList = ({ questions = [], projectContext = '', repoinfo = {} }) => {
    const [followUpData, setFollowUpData] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [answersData, setAnswersData] = useState({});
    const [answerLoadingStates, setAnswerLoadingStates] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [allQuestions, setAllQuestions] = useState(questions);
    const [loadingMore, setLoadingMore] = useState(false);

    // Helper function to extract question text from either string or object
    const getQuestionText = (question) => {
        if (typeof question === 'string') return question;
        if (typeof question === 'object' && question.question) return question.question;
        return String(question);
    };

    // Update allQuestions when props change
    useEffect(() => {
        setAllQuestions(questions);
    }, [questions]);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            // Simulate loading more questions
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Duplicate existing questions with slight variations to simulate pagination
            // In production, this would call the API with pagination parameters
            const additionalQuestions = questions.map((q, i) => {
                if (typeof q === 'object') {
                    return { 
                        ...q, 
                        question: q.question || q,
                        topic: q.topic || 'General',
                        difficulty: q.difficulty || 'Medium'
                    };
                }
                return {
                    question: q,
                    topic: 'General',
                    difficulty: 'Medium'
                };
            });
            
            setAllQuestions(prev => [...prev, ...additionalQuestions]);
            setCurrentPage(prev => prev + 1);
        } catch (error) {
            console.error('Error loading more questions:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleGetAnswer = async (question, index) => {
        // Return early if already cached
        if (answersData[index]) return;

        const questionText = getQuestionText(question);
        setAnswerLoadingStates(prev => ({ ...prev, [index]: true }));

        try {
            const response = await API.post('/answer', { question: questionText, projectContext });
            console.log('Answer response:', response.data);
            
            // Handle response format
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
            
            setAnswersData(prev => ({ ...prev, [index]: answerText }));
        } catch (error) {
            console.error('Error fetching answer:', error);
            setAnswersData(prev => ({ ...prev, [index]: 'Failed to fetch answer. Please try again.' }));
        } finally {
            setAnswerLoadingStates(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleDigDeeper = async (question, index) => {
        // Return early if already cached
        if (followUpData[index]) return;

        const questionText = getQuestionText(question);
        setLoadingStates(prev => ({ ...prev, [index]: true }));

        try {
            const requestBody = { question: questionText, projectContext };
            console.log('Follow-up request:', requestBody);
            console.log('Project context length:', projectContext?.length || 0);
            
            const response = await API.post('/followup', requestBody);
            console.log('Follow-up response structure:', response.data);
            console.log('Follow-up response.data:', response.data.data);
            console.log('Type of response.data.data:', typeof response.data.data);
            
            // Extract the chain array from the response
            let chainData = [];
            
            // Handle case where data is a JSON string
            if (typeof response.data.data === 'string') {
                try {
                    const parsedData = JSON.parse(response.data.data);
                    console.log('Parsed JSON string:', parsedData);
                    if (parsedData.chain && Array.isArray(parsedData.chain)) {
                        chainData = parsedData.chain;
                        console.log('Extracted chain from parsed JSON:', chainData);
                    }
                } catch (parseError) {
                    console.error('Failed to parse JSON string:', parseError);
                }
            } 
            // Handle case where data is an object with chain property
            else if (response.data.data?.chain) {
                chainData = response.data.data.chain;
                console.log('Extracted chain from response.data.data.chain:', chainData);
            } 
            // Handle case where data is directly an array
            else if (Array.isArray(response.data.data)) {
                chainData = response.data.data;
                console.log('Extracted chain as array from response.data.data:', chainData);
            } 
            // Handle case where response.data is an array
            else if (Array.isArray(response.data)) {
                chainData = response.data;
                console.log('Extracted chain as array from response.data:', chainData);
            } else {
                console.log('Could not extract chain from response. Available keys:', Object.keys(response.data.data || {}));
            }
            
            console.log('Final chain data to set:', chainData);
            setFollowUpData(prev => ({ ...prev, [index]: chainData }));
        } catch (error) {
            console.error('Error fetching follow-up questions:', error);
            console.error('Error response:', error.response?.data);
            // Set empty array on error to prevent infinite loading
            setFollowUpData(prev => ({ ...prev, [index]: [] }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [index]: false }));
        }
    };

    if (!allQuestions || allQuestions.length === 0) {
        return (
            <div className='m-4 font-fraunces'>
                <p className='text-xl font-semibold text-dark'>Interview Questions</p>
                <p className='text-gray mt-4'>No questions available yet.</p>
            </div>
        );
    }

    return (
        <div className='m-4 font-fraunces'>
            <p className='text-xl font-semibold text-dark'>Interview Questions</p>
            
            <div className='mt-4 space-y-4'>
                {allQuestions.map((question, index) => {
                    const questionText = getQuestionText(question);
                    const topic = typeof question === 'object' && question.topic ? question.topic : null;
                    const difficulty = typeof question === 'object' && question.difficulty ? question.difficulty : null;
                    
                    return (
                        <div key={index} className='border border-dark rounded-lg p-4 bg-white shadow-sm'>
                            <div className='flex justify-between items-start'>
                                <div className='flex-1'>
                                    {(topic || difficulty) && (
                                        <div className='flex gap-2 mb-2'>
                                            {topic && (
                                                <span className='px-2 py-0.5 bg-background-secondary text-dark text-xs rounded-md font-medium'>
                                                    {topic}
                                                </span>
                                            )}
                                            {difficulty && (
                                                <span className='px-2 py-0.5 bg-secondary text-white text-xs rounded-md font-medium'>
                                                    {difficulty}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <p className='text-md font-medium text-dark'>
                                        <span className='font-bold text-dark mr-2'>{index + 1}.</span>
                                        {questionText}
                                    </p>
                                </div>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => handleDigDeeper(question, index)}
                                        disabled={loadingStates[index]}
                                        className='px-3 py-1 bg-secondary text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {loadingStates[index] ? 'Loading...' : followUpData[index] ? 'View follow-ups' : 'Dig deeper'}
                                    </button>
                                    <button
                                        onClick={() => handleGetAnswer(question, index)}
                                        disabled={answerLoadingStates[index]}
                                        className='px-3 py-1 border border-dark text-dark rounded-md text-sm font-medium hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {answerLoadingStates[index] ? 'Loading...' : answersData[index] ? 'View answer' : 'See answer'}
                                    </button>
                                </div>
                            </div>
                            
                            {followUpData[index] && (
                                <div className='mt-4 ml-6'>
                                    <FollowUpChain chain={followUpData[index]} projectContext={projectContext} />
                                </div>
                            )}
                            
                            {answersData[index] && (
                                <div className='mt-4 ml-6 p-4 bg-background-secondary rounded-md border border-dark/30'>
                                    <p className='text-sm font-semibold text-dark mb-2'>Answer:</p>
                                    <p className='text-sm text-gray leading-relaxed'>{answersData[index]}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className='mt-6 px-4 py-2 border border-dark text-dark rounded-md font-medium hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
                {loadingMore ? 'Loading...' : 'Load more questions'}
            </button>
        </div>
    );
};

export default QuestionList;