'use client';

import { useState, useEffect, FormEvent } from 'react';
import { generateAnimation, checkJobStatus, getVideoUrl, testVideoAccess, AnimationResult } from '@/lib/manimApi';

export default function AnimationGenerator() {
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState(2);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnimationResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Improved polling that falls back to direct video check
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let attempt = 0;
    const MAX_ATTEMPTS = 30; // 30 attempts = 1.5 minutes at 3-second intervals
    
    if (jobId && !videoUrl) {
      intervalId = setInterval(async () => {
        attempt++;
        console.log(`Status check attempt ${attempt} for job ${jobId}`);
        
        try {
          // First try direct video access after a few attempts
          if (attempt > 5) {
            const videoExists = await testVideoAccess(jobId);
            if (videoExists) {
              console.log("Video exists! Setting URL directly");
              clearInterval(intervalId);
              setVideoUrl(getVideoUrl(jobId));
              setLoading(false);
              return;
            }
          }

          // Fall back to status API
          const result = await checkJobStatus(jobId);
          console.log("Status result:", result);
          setStatus(result);
          
          if (result.success) {
            clearInterval(intervalId);
            const finalVideoUrl = result.video_url || getVideoUrl(jobId);
            setVideoUrl(finalVideoUrl);
            setLoading(false);
          }
          
          if (result.error) {
            clearInterval(intervalId);
            setError(`Error generating animation: ${result.error}`);
            setLoading(false);
          }
        } catch (err) {
          console.error('Error checking job status:', err);
          
          // Give up after max attempts
          if (attempt >= MAX_ATTEMPTS) {
            clearInterval(intervalId);
            setError('Failed to check job status. Please try using the direct video access button below.');
            setLoading(false);
          }
        }
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, videoUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setJobId(null);
    setStatus(null);
    
    try {
      const result = await generateAnimation({ prompt, complexity });
      console.log("Generation result:", result);
      setJobId(result.job_id);
    } catch (err) {
      console.error('Error generating animation:', err);
      setError(`Failed to generate animation: ${err.message}`);
      setLoading(false);
    }
  };

  // Manual direct video access
  const tryDirectVideoAccess = async () => {
    if (!jobId) return;
    
    setError(null);
    setLoading(true);
    
    try {
      const videoExists = await testVideoAccess(jobId);
      
      if (videoExists) {
        setVideoUrl(getVideoUrl(jobId));
        setLoading(false);
      } else {
        setError("Video not found. It may still be processing.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error testing video access:", err);
      setError("Failed to check if video exists. Network error.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Manim Animation Generator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Animation Prompt:
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A circle transforming into a square"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-1">
            Complexity (1-5):
          </label>
          <input
            type="range"
            id="complexity"
            min="1"
            max="5"
            value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))}
            disabled={loading}
            className="w-full"
          />
          <div className="text-center">{complexity}</div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading || !prompt.trim() 
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? 'Generating Animation...' : 'Generate Animation'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          {jobId && (
            <button 
              onClick={tryDirectVideoAccess}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Try Direct Video Access
            </button>
          )}
        </div>
      )}
      
      {loading && !videoUrl && (
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            Creating your animation... This may take a minute.
            {status && (
              <span className="block mt-1 text-sm text-gray-500">
                Status: {status.success ? 'Completed' : 'Processing'}
              </span>
            )}
          </p>
          
          {jobId && (
            <button 
              onClick={tryDirectVideoAccess}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Check if video is ready now
            </button>
          )}
        </div>
      )}
      
      {videoUrl && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Your Animation</h3>
          <div className="relative pt-[56.25%] bg-black rounded overflow-hidden">
            <video 
              controls 
              src={videoUrl} 
              className="absolute top-0 left-0 w-full h-full"
              onError={(e) => {
                console.error("Video error:", e);
                setError(`Failed to load video. Try the direct link below.`);
              }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-sm text-gray-500">Prompt: {prompt}</span>
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 hover:text-indigo-800"
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}