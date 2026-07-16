import React, { useState } from 'react';
import API from '../../api/axios';

const FollowUpChain = ({ chain, projectContext }) => {
    console.log('FollowUpChain received chain:', chain);
    
    const [answersData, setAnswersData] = useState({});
    const [answerLoadingStates, setAnswerLoadingStates] = useState({});
    
    // Handle both object with chain property and direct array
    let chainArray = [];
    if (Array.isArray(chain)) {
        chainArray = chain;
    } else if (typeof chain === 'object' && chain.chain && Array.isArray(chain.chain)) {
        chainArray = chain.chain;
    }
    
    const handleGetAnswer = async (followUp, index) => {
        if (answersData[index]) return;

        setAnswerLoadingStates(prev => ({ ...prev, [index]: true }));

        try {
            const response = await API.post('/answer', { question: followUp, projectContext });
            console.log('Follow-up answer response:', response.data);
            
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
            console.error('Error fetching follow-up answer:', error);
            setAnswersData(prev => ({ ...prev, [index]: 'Failed to fetch answer. Please try again.' }));
        } finally {
            setAnswerLoadingStates(prev => ({ ...prev, [index]: false }));
        }
    };
    
    if (!chainArray || chainArray.length === 0) {
        return (
            <div className='mt-3 p-3 bg-background-secondary rounded-md border border-dark/30'>
                <p className='text-sm text-gray italic'>No follow-up questions available for this question.</p>
                <p className='text-xs text-gray mt-1'>The AI might not have enough context to generate relevant follow-ups.</p>
            </div>
        );
    }

    return (
        <div className='space-y-3'>
            {chainArray.map((followUp, index) => (
                <div key={index} className='flex items-start'>
                    <div className='flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-3 mt-0.5'>
                        <div className='w-2 h-2 rounded-full bg-white' />
                    </div>
                    <div className='flex-1'>
                        <div className='flex justify-between items-start'>
                            <p className='text-sm font-medium text-gray flex-1'>
                                <span className='font-semibold text-dark'>Follow-up {index + 1}:</span> {followUp}
                            </p>
                            <button
                                onClick={() => handleGetAnswer(followUp, index)}
                                disabled={answerLoadingStates[index]}
                                className='px-2 py-1 border border-dark text-dark rounded-md text-xs font-medium hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed ml-2'
                            >
                                {answerLoadingStates[index] ? 'Loading...' : answersData[index] ? 'View answer' : 'See answer'}
                            </button>
                        </div>
                        {answersData[index] && (
                            <div className='mt-2 p-3 bg-background-secondary rounded-md border border-dark/30'>
                                <p className='text-xs font-semibold text-dark mb-1'>Answer:</p>
                                <p className='text-xs text-gray leading-relaxed'>{answersData[index]}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FollowUpChain;