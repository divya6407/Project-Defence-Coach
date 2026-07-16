import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import API from '../../api/axios.js';

const LandingPage = () => {

  const [url, seturl] = useState("");
  const [repoInfo, setrepoInfo] = useState({
    owner: "",
    repo: "",
    techStack: [],
    stackWise: { frontend: [], backend: [], tools: [] },
    fileTree: [],
    projectType: "",
    readme: "",
    dependencies: [],
    additionalDocs: []
  })
  const [err, seterr] = useState("");
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault()
    setloading(true);
    seterr(""); // Clear previous errors on every fresh submission

    try {
      const response = await API.post('/repo-info', { repoURL: url });
      const payload = response.data;

      const updatedRepoInfo = {
        owner: payload.owner || "",
        repo: payload.repo || "",
        techStack: payload.techStack || [],
        stackWise: payload.stackWise || { frontend: [], backend: [], tools: [] },
        fileTree: payload.fileTree || [],
        fileTreeSummary: payload.fileTreeSummary || "",
        projectType: payload.projectType || "",
        readme: payload.readme || "",
        dependencies: payload.dependencies || [],
        additionalDocs: payload.additionalDocs || []
      };
      setrepoInfo(updatedRepoInfo);
      navigate("/analyze", { state: { repoInfo: updatedRepoInfo } });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to connect to the server.";
      seterr(errorMsg);
      console.log(error.response?.data?.message || error.message);
      setloading(false);
      // Already handled correctly in catch
    }
    finally {
      setloading(false);

    }
  }

  const steps = [
    {
      number: 1,
      icon: <LinkIcon sx={{ fontSize: 28, color: '#2d2d2d', transform: 'rotate(-45deg)' }} />,
      title: 'Add repo URL',
      description: 'Paste your GitHub repository link.',
    },
    {
      number: 2,
      icon: <SearchIcon sx={{ fontSize: 28, color: '#2d2d2d' }} />,
      title: 'We analyze',
      description: 'We read your code, structure, and dependencies.',
    },
    {
      number: 3,
      icon: <AssignmentIcon sx={{ fontSize: 28, color: '#2d2d2d' }} />,
      title: 'We prepare',
      description: 'We generate summaries, diagrams, and questions.',
    },
    {
      number: 4,
      icon: <ForumIcon sx={{ fontSize: 28, color: '#2d2d2d' }} />,
      title: 'You practice',
      description: 'Walk into your interview with confidence.',
    },
  ];

  return (
    <div className='bg-background-secondary font-fraunces w-screen min-h-screen m-0 p-0 overflow-x-hidden flex flex-col justify-between pb-12'>
      <div className='w-full'>
        {/*HEADER*/}
        <div className='flex items-center gap-4 p-4 m-0 w-full'>
          <AccountTreeIcon sx={{ fontSize: 40, color: '#bd421f' }} />
          <h3 className='text-dark text-xl font-semibold'>Project Defence Coach</h3>
        </div>

        {/*HERO SECTION CONTAINER*/}
        <div className='max-w-4xl mx-auto px-4 mt-16 flex flex-col items-center'>
          <div className='text-5xl font-extrabold text-center tracking-tight leading-tight'>
            <p className='text-black mb-4'>Understand Your Code.</p>
            <p className='text-heading'>Explain it with Confidence.</p>
          </div>

          <p className='text-center text-xl mt-6 font-medium text-gray-700 max-w-2xl leading-relaxed'>
            Project Defence Coach analyzes your GitHub repository <br className='hidden md:inline' />
            and helps you rehearse explaining it in a Technical Interview.
          </p>

          {/* HORIZONTALLY ALIGNED INPUT FORM SECTION */}
          <div className='w-full max-w-2xl mt-10'>

            {/* CONDITIONAL ERROR ALERT BANNER */}
            {err && (
              <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-sans shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{err}</span>
                </div>
                <button
                  onClick={() => seterr("")}
                  className="text-red-500 hover:text-red-800 font-bold ml-4 cursor-pointer focus:outline-none"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}

            <form className='flex flex-row items-center justify-between bg-white p-2 pl-4 rounded-xl shadow-sm border border-gray-100 gap-4 w-full' onSubmit={handleSubmit}>
              <div className='flex items-center gap-3 flex-1'>
                <LinkIcon sx={{ fontSize: 26, color: '#878484' }} />
                <input

                  placeholder='Enter your GitHub repository link...'
                  className='w-full bg-transparent border-none outline-none text-gray-800 text-lg placeholder-gray-400 py-2'
                  value={url}
                  onChange={(e) => seturl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                className={`font-bold px-6 py-3 rounded-lg text-white transition-all whitespace-nowrap cursor-pointer ${loading ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-dark hover:opacity-90'
                  }`}
                type='submit'
                disabled={loading}
              >
                {/* IMPROVEMENT: Visual button state feedback */}
                {loading ? 'Analyzing...' : 'Analyze Repository'}
              </button>
            </form>
            <p className='text-gray text-center mt-4'>Example https://github.com/username/repo-name</p>
          </div>

          {/*DIVIDER*/}
          <div className="flex items-center w-full my-12">
            <div className="flex-grow border-t border-solid border-gray"></div>
            <span className="mx-4 font-bold tracking-wide text-black whitespace-nowrap">
              How it works
            </span>
            <div className="flex-grow border-t border-solid border-gray"></div>
          </div>

          {/*HOW IT WORKS GRID BLOCK*/}
          <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 mt-4'>
            {steps.map((step) => (
              <div key={step.number} className='flex flex-col items-center text-center'>
                <div className='relative mb-4'>
                  <span className='absolute -top-4 left-1/2 -translate-x-1/2 text-sm font-bold text-[#bd421f]'>
                    {step.number}
                  </span>

                  <div className='w-[64px] h-[64px] rounded-full bg-[#fdf2e9] flex items-center justify-center shadow-sm'>
                    {step.icon}
                  </div>
                </div>

                <h4 className='text-black font-bold text-lg mb-1 tracking-wide'>
                  {step.title}
                </h4>

                <p className='text-gray-600 text-sm max-w-[180px] leading-relaxed'>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}

export default LandingPage
