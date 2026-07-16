import React, { useEffect } from 'react'

const TechStackCard = ({ repoinfo }) => {
    const { backend, frontend, tools } = repoinfo.stackWise;
    console.log(repoinfo.stackWise);
    return (
        <div>
            <div className='m-4'>
                <p className='text-xl font-semibold '>TechStack</p>
                {/*FRONTEND*/}
                <div>
                    <p className='text-md font-semibold mt-4'>Frontend</p>
                    <div className='flex gap-4 mt-4'>
                        {frontend.map((feature, index) => (
                            <div key={index} className='p-2 bg-secondary rounded-xl font-extrabold text-white'>
                                <p className='font-bold'>{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/*BACKEND*/}
                <div>
                    <p className='text-md font-semibold mt-4'>Backend</p>
                    <div className='flex gap-4 mt-4'>
                        {backend.map((feature, index) => (
                            <div key={index} className='p-2 bg-secondary rounded-xl font-extrabold text-white'>
                                <p className='font-bold'>{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>


                {/*TOOLS*/}

                <div>
                    <p className='text-md font-semibold mt-4'>Dev Tools</p>
                    <div className='flex gap-4 mt-4'>
                        {tools.map((feature, index) => (
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

export default TechStackCard