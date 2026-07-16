import React, { useState } from 'react';

const FileExplorer = ({ fileTree = [], onFileClick }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [selectedFile, setSelectedFile] = useState(null);

    // Build nested tree structure from flat fileTree
    const buildTree = (items) => {
        const root = {};
        
        items.forEach(item => {
            const parts = item.path.split('/');
            let current = root;
            
            parts.forEach((part, index) => {
                const isLastPart = index === parts.length - 1;
                const fullPath = parts.slice(0, index + 1).join('/');
                
                if (!current[part]) {
                    current[part] = {
                        name: part,
                        isFolder: !isLastPart || item.type === 'tree',
                        children: {},
                        path: fullPath,
                        type: item.type
                    };
                }
                
                // Only navigate to children if this isn't the last part
                if (!isLastPart) {
                    current = current[part].children;
                }
            });
        });
        
        return root;
    };

    const tree = buildTree(fileTree);

    const toggleFolder = (path) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    const handleFileClick = (path) => {
        setSelectedFile(path);
        onFileClick(path);
    };

    const renderTree = (node, path = '') => {
        const entries = Object.values(node);
        
        // Sort: folders first, then files, alphabetically
        entries.sort((a, b) => {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            return a.name.localeCompare(b.name);
        });

        return entries.map((item) => {
            const fullPath = path ? `${path}/${item.name}` : item.name;
            const isExpanded = expandedFolders.has(fullPath);
            const isSelected = selectedFile === fullPath;

            if (item.isFolder) {
                return (
                    <div key={fullPath} className='ml-4'>
                        <div
                            onClick={() => toggleFolder(fullPath)}
                            className='flex items-center py-1 px-2 rounded cursor-pointer hover:bg-background-secondary transition-colors'
                        >
                            <span className='mr-2 text-dark transform transition-transform text-xs'>
                                {isExpanded ? '▼' : '▶'}
                            </span>
                            <span className='text-dark font-medium'>
                                📁 {item.name}
                            </span>
                        </div>
                        {isExpanded && Object.keys(item.children).length > 0 && (
                            <div className='ml-2'>
                                {renderTree(item.children, fullPath)}
                            </div>
                        )}
                    </div>
                );
            } else {
                return (
                    <div
                        key={fullPath}
                        onClick={() => handleFileClick(fullPath)}
                        className={`ml-4 flex items-center py-1 px-2 rounded cursor-pointer transition-colors ${
                            isSelected 
                                ? 'bg-secondary text-white' 
                                : 'hover:bg-background-secondary text-dark'
                        }`}
                    >
                        <span className='mr-2'>📄</span>
                        <span className='font-medium'>{item.name}</span>
                    </div>
                );
            }
        });
    };

    return (
        <div className='m-4 font-fraunces'>
            <p className='text-xl font-semibold text-dark mb-4'>File Explorer</p>
            <div className='border border-dark rounded-lg p-4 bg-white shadow-sm max-h-96 overflow-y-auto'>
                {fileTree.length === 0 ? (
                    <p className='text-gray text-center py-4'>No files found</p>
                ) : (
                    renderTree(tree)
                )}
            </div>
        </div>
    );
};

export default FileExplorer;