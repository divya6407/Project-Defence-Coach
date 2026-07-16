import React, { useState } from 'react';

const CheatSheet = ({ summary = {}, techStack = [], features = [], architecture = {}, questions = [] }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    // Helper function to extract question text from either string or object
    const getQuestionText = (question) => {
        if (typeof question === 'string') return question;
        if (typeof question === 'object' && question.question) return question.question;
        return String(question);
    };

    const generateMarkdown = () => {
        let markdown = '# Project Defense Cheat Sheet\n\n';

        // Project Overview
        if (summary?.detailedSummary) {
            markdown += '## Project Overview\n\n';
            markdown += `${summary.detailedSummary}\n\n`;
        }

        // Tech Stack
        if (techStack && techStack.length > 0) {
            markdown += '## Tech Stack\n\n';
            techStack.forEach(tech => {
                markdown += `- ${tech}\n`;
            });
            markdown += '\n';
        }

        // Architecture
        if (architecture?.explanation) {
            markdown += '## Architecture\n\n';
            markdown += `${architecture.explanation}\n\n`;
        }

        // Key Features
        if (features && features.length > 0) {
            markdown += '## Key Features\n\n';
            features.forEach(feature => {
                markdown += `- ${feature}\n`;
            });
            markdown += '\n';
        }

        // Interview Questions
        if (questions && questions.length > 0) {
            markdown += '## Interview Questions\n\n';
            questions.forEach((question, index) => {
                const questionText = getQuestionText(question);
                const topic = typeof question === 'object' && question.topic ? question.topic : null;
                const difficulty = typeof question === 'object' && question.difficulty ? question.difficulty : null;
                
                let questionLine = `${index + 1}. ${questionText}`;
                if (topic || difficulty) {
                    const tags = [];
                    if (topic) tags.push(`Topic: ${topic}`);
                    if (difficulty) tags.push(`Difficulty: ${difficulty}`);
                    questionLine += ` (${tags.join(', ')})`;
                }
                markdown += `${questionLine}\n`;
            });
            markdown += '\n';
        }

        return markdown;
    };

    const handleCopyToClipboard = async () => {
        try {
            const markdown = generateMarkdown();
            await navigator.clipboard.writeText(markdown);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <div className='m-4 font-fraunces'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-xl font-semibold text-dark'>Cheat Sheet</h1>
                <button
                    onClick={handleCopyToClipboard}
                    className='px-4 py-2 bg-secondary text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2'
                >
                    {copySuccess ? '✓ Copied!' : '📋 Copy as Markdown'}
                </button>
            </div>

            <div className='space-y-6 bg-white border border-dark rounded-lg p-6 shadow-sm'>
                {/* Project Overview */}
                {summary?.detailedSummary && (
                    <div>
                        <h2 className='text-lg font-semibold text-dark mb-3'>Project Overview</h2>
                        <p className='text-gray leading-relaxed'>{summary.detailedSummary}</p>
                    </div>
                )}

                {/* Tech Stack */}
                {techStack && techStack.length > 0 && (
                    <div>
                        <h2 className='text-lg font-semibold text-dark mb-3'>Tech Stack</h2>
                        <div className='flex flex-wrap gap-2'>
                            {techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className='px-3 py-1 bg-secondary text-white rounded-full text-sm font-medium'
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Architecture */}
                {architecture?.explanation && (
                    <div>
                        <h2 className='text-lg font-semibold text-dark mb-3'>Architecture</h2>
                        <p className='text-gray leading-relaxed'>{architecture.explanation}</p>
                    </div>
                )}

                {/* Key Features */}
                {features && features.length > 0 && (
                    <div>
                        <h2 className='text-lg font-semibold text-dark mb-3'>Key Features</h2>
                        <ul className='space-y-2'>
                            {features.map((feature, index) => (
                                <li key={index} className='flex items-start text-gray'>
                                    <span className='text-dark font-bold mr-2'>•</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Interview Questions */}
                {questions && questions.length > 0 && (
                    <div>
                        <h2 className='text-lg font-semibold text-dark mb-3'>Interview Questions</h2>
                        <ul className='space-y-3'>
                            {questions.map((question, index) => {
                                const questionText = getQuestionText(question);
                                const topic = typeof question === 'object' && question.topic ? question.topic : null;
                                const difficulty = typeof question === 'object' && question.difficulty ? question.difficulty : null;
                                
                                return (
                                    <li key={index} className='flex items-start text-gray'>
                                        <span className='text-dark font-bold mr-2 mt-1'>{index + 1}.</span>
                                        <div className='flex-1'>
                                            {(topic || difficulty) && (
                                                <div className='flex gap-2 mb-1'>
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
                                            <span>{questionText}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheatSheet;