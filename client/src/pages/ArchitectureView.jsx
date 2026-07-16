import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const ArchitectureView = ({ repoinfo }) => {
    const [diagram, setdiagram] = useState("");
    const [explanation, setexplanation] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArchitecture = async () => {
            try {
                const body = {
                    techStack: repoinfo.techStack,
                    fileTreeSummary: repoinfo.fileTreeSummary,
                    projectType: repoinfo.projectType
                };
                setLoading(true);
                const response = await API.post('/architecture', body);

                // Static match fallbacks for missing/empty API outputs
                console.log(response.data.data.diagram);
                setdiagram(response.data.data.diagram);
                setexplanation(response.data.data.explanation);
            } catch (error) {
                console.error("Error fetching architecture:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArchitecture();
    }, [repoinfo]);

    const parseDiagram = (str) => {
        if (!str) return [];
        return str.split(/[\n\s]*↓[\n\s]*/).map(line => {
            const sideMatch = line.match(/\[Side:\s*(.*?)\]/);
            let mainText = line.replace(/\[Side:\s*.*?\]/, '').trim();
            let sideText = sideMatch ? sideMatch[1].trim() : null;

            const formatNode = (text) => {
                const hasSub = text.includes('(');
                return {
                    title: hasSub ? text.split('(')[0].trim() : text,
                    sub: hasSub ? text.slice(text.indexOf('(') + 1, text.lastIndexOf(')')).trim() : ''
                };
            };

            return {
                main: formatNode(mainText),
                side: sideText ? formatNode(sideText) : null
            };
        });
    };

    const parseExplanation = (str) => {
        if (!str) return [];
        return str.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
    };

    const nodes = parseDiagram(diagram);
    const steps = parseExplanation(explanation);

    if (loading) {
        return <div className="text-center py-12 text-gray font-medium tracking-wide font-fraunces">Loading Architecture...</div>;
    }

    return (
        /* Outer Container matching Dashboard background style */
        <div className="w-full max-w-6xl mx-auto p-8 rounded-2xl bg-background-secondary border border-dark shadow-md font-fraunces m-4">

            {/* Header section matching exact layout label font */}
            <h1 className="text-xl font-bold text-dark mb-8 tracking-tight">
                Architecture
            </h1>

            {/* Split Panel Setup: 3/5 Space to diagram pipeline, 2/5 Space to Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

                {/* LEFT BLOCK: The Flowchart Pipeline */}
                <div className="lg:col-span-3 flex flex-col items-center w-full pt-4">
                    {nodes.map((node, index) => (
                        <div key={index} className="w-full flex flex-col items-center">

                            {/* Layer Box Wrapper */}
                            <div className="flex items-center justify-center w-full relative max-w-md">

                                {/* Core Component Layer */}
                                <div className="w-full max-w-[280px] sm:max-w-xs border border-dark rounded-lg p-3.5 bg-white text-center shadow-sm">
                                    <h3 className="font-bold text-dark text-xs tracking-wide">{node.main.title}</h3>
                                    {node.main.sub && (
                                        <p className="text-[11px] text-gray font-medium mt-0.5">({node.main.sub})</p>
                                    )}
                                </div>

                                {/* Attached Secondary Auth Anchor Box */}
                                {node.side && (
                                    <div className="absolute left-[78%] sm:left-[82%] flex items-center hidden sm:flex">
                                        {/* Precision SVG Path Arrow representing the dashed link from the image */}
                                        <div className="w-10 flex items-center justify-center relative">
                                            <svg className="w-full h-3 overflow-visible text-dark" viewBox="0 0 40 12" fill="none">
                                                <path d="M0,6 H34" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
                                                <path d="M34,3 L39,6 L34,9 Z" fill="currentColor" />
                                            </svg>
                                        </div>
                                        {/* Side Card */}
                                        <div className="border border-dark rounded-lg p-3 bg-white text-center shadow-sm max-w-[130px] whitespace-normal">
                                            <h4 className="font-bold text-dark text-[11px] tracking-wide">{node.side.title}</h4>
                                            {node.side.sub && (
                                                <p className="text-[10px] text-gray font-medium mt-0.5">({node.side.sub})</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Crisp downward connector line and arrow tip */}
                            {index < nodes.length - 1 && (
                                <div className="my-2.5 flex flex-col items-center">
                                    <svg className="w-4 h-7 text-dark overflow-visible" viewBox="0 0 12 28" fill="none">
                                        <line x1="6" y1="0" x2="6" y2="23" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M2,20 L6,25 L10,20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* RIGHT BLOCK: Explanation Card matching Dashboard style */}
                <div className="lg:col-span-2 bg-white border border-dark rounded-xl p-6 shadow-md">
                    <h2 className="text-sm font-bold text-dark mb-5 tracking-wide">
                        How it works
                    </h2>
                    <ol className="space-y-4">
                        {steps.map((step, idx) => (
                            <li key={idx} className="flex items-start text-[11px] sm:text-xs leading-relaxed text-gray font-medium">
                                <span className="text-dark font-bold mr-3 text-xs min-w-[14px]">
                                    {idx + 1}.
                                </span>
                                <span className="mt-0.5">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

            </div>
        </div>
    );
};

export default ArchitectureView;
