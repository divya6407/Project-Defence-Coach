import React from 'react'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CategoryIcon from '@mui/icons-material/Category';
import ExtensionIcon from '@mui/icons-material/Extension';
import ArticleIcon from '@mui/icons-material/Article';

const SummaryCard = ({ repoinfo, shortSummary, detailedSummary, features }) => {

    const stats = [
        { icon: <InsertDriveFileIcon sx={{ fontSize: 20, color: '#B84E2B' }} />, label: 'Total Files', value: repoinfo.fileTree?.length || 0 },
        { icon: <CategoryIcon sx={{ fontSize: 20, color: '#B84E2B' }} />, label: 'Project Type', value: repoinfo.projectType || 'N/A' },
        { icon: <ExtensionIcon sx={{ fontSize: 20, color: '#B84E2B' }} />, label: 'Dependencies', value: repoinfo.dependencies?.length || 0 },
        { icon: <ArticleIcon sx={{ fontSize: 20, color: '#B84E2B' }} />, label: 'Extra Docs', value: repoinfo.additionalDocs?.length || 0 },
    ];

    return (
        <div className='m-4'>
            <div>
                {/* TOP ROW: 30-sec summary | 2-min summary */}
                <div className='flex justify-evenly gap-16'>
                    {/*30 SEC SUMMARY */}
                    <div className='flex-1'>
                        <p className='text-xl font-semibold'>30-second summary</p>
                        <div
                            className='mt-4 rounded-md p-6 text-justify leading-relaxed relative overflow-hidden'
                            style={{
                                backgroundColor: '#FEF7C3',
                                border: '2px solid #FEF7C3',
                                backgroundImage: `
                                    repeating-linear-gradient(
                                        transparent,
                                        transparent 31px,
                                        #e5d9a0 31px,
                                        #e5d9a0 32px
                                    ),
                                    linear-gradient(to right, #B84E2B 2px, transparent 2px)
                                `,
                                backgroundPosition: '0 12px, 24px 0',
                                backgroundSize: '100% 32px, 100% 100%',
                                minHeight: '200px',
                                lineHeight: '32px',
                                paddingLeft: '36px'
                            }}
                        >
                            <p className='font-bold italic relative z-10' style={{ lineHeight: '32px' }}>{shortSummary}</p>
                        </div>

                        {/* AT A GLANCE - below 30-sec summary */}
                        <div className='mt-6 border border-dark rounded-md p-4'>
                            <p className='text-lg font-semibold'>At a Glance</p>
                            <div className='mt-3'>
                                {stats.map((stat, index) => (
                                    <React.Fragment key={index}>
                                        <div className='flex items-center gap-3 py-3'>
                                            <span className='flex-shrink-0'>{stat.icon}</span>
                                            <span className='text-sm font-medium text-gray-600'>{stat.label}</span>
                                            <span className='text-sm font-bold text-gray-900 ml-auto'>{stat.value}</span>
                                        </div>
                                        {index < stats.length - 1 && <hr className='border-t border-gray-200' />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/*2 MIN SUMMARY */}
                    <div className='flex-1'>
                        <p className='text-xl font-semibold'>2 minutes summary</p>
                        <div
                            className='mt-4 rounded-md p-6 text-justify leading-relaxed relative overflow-hidden'
                            style={{
                                backgroundColor: '#FEF7C3',
                                border: '2px solid #FEF7C3',
                                backgroundImage: `
                                    repeating-linear-gradient(
                                        transparent,
                                        transparent 31px,
                                        #e5d9a0 31px,
                                        #e5d9a0 32px
                                    ),
                                    linear-gradient(to right, #B84E2B 2px, transparent 2px)
                                `,
                                backgroundPosition: '0 12px, 24px 0',
                                backgroundSize: '100% 32px, 100% 100%',
                                minHeight: '200px',
                                lineHeight: '32px',
                                paddingLeft: '36px'
                            }}
                        >
                            <p className='font-bold italic relative z-10' style={{ lineHeight: '32px' }}>{detailedSummary}</p>
                        </div>
                    </div>
                </div>

                {/* FEATURES SECTION BELOW */}
                <div className='mt-8 border border-dark p-4 rounded-md'>
                    <p className='text-xl font-semibold '>Detected Features</p>
                    <div className='flex flex-wrap gap-4 mt-4'>
                        {features.map((feature, index) => (
                            <div key={index} className='p-2 bg-secondary rounded-xl font-extrabold text-white'>
                                <p className='font-bold'>{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default SummaryCard