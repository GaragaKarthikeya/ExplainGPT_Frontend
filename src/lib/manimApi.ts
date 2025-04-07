// API service for Manim animations
const API_BASE_URL = process.env.NEXT_PUBLIC_MANIM_API_URL || 'https://absolute-seriously-shrew.ngrok-free.app';

export interface AnimationRequest {
  prompt: string;
  complexity?: number;
}

export interface AnimationResponse {
  job_id: string;
  message: string;
  status: string;
}

export interface AnimationResult {
  job_id: string;
  success: boolean;
  error?: string;
  video_url?: string;
  still_processing?: boolean;
}

// Helper to ensure proper URL formatting
function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url.replace(/^\/+/, '')}`;
  }
  return url;
}

// Generate a new animation
export async function generateAnimation(request: AnimationRequest): Promise<AnimationResponse> {
  console.log("Generating animation with prompt:", request.prompt);
  
  const url = `${normalizeUrl(API_BASE_URL)}/generate`;
  console.log("Request URL:", url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("Generate animation error:", err);
    throw err;
  }
}

// Check the status of an animation job with better handling
export async function checkJobStatus(jobId: string): Promise<AnimationResult> {
  console.log("Checking status for job:", jobId);
  
  const url = `${normalizeUrl(API_BASE_URL)}/status/${jobId}`;
  console.log("Status URL:", url);
  
  try {
    // First check if video exists directly
    const videoExists = await testVideoAccess(jobId);
    
    if (videoExists) {
      console.log("Video exists! Returning success result");
      return {
        job_id: jobId,
        success: true,
        video_url: getVideoUrl(jobId)
      };
    }
    
    // If video doesn't exist yet, try status endpoint
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log("Status endpoint returned error:", response.status);
      // Don't throw an error, just indicate processing is still happening
      return {
        job_id: jobId,
        success: false,
        still_processing: true
      };
    }
    
    // Try to parse JSON response
    try {
      return await response.json();
    } catch (parseError) {
      console.warn("Failed to parse status response as JSON");
      // Don't throw error, just indicate processing
      return {
        job_id: jobId,
        success: false,
        still_processing: true
      };
    }
  } catch (err) {
    console.error("Check job status error:", err);
    // Don't throw error, assume still processing
    return {
      job_id: jobId,
      success: false,
      still_processing: true,
      error: "Could not determine status, but animation may still be processing"
    };
  }
}

// Get the full video URL
export function getVideoUrl(jobId: string): string {
  return `${normalizeUrl(API_BASE_URL)}/videos/${jobId}.mp4`;
}

// Test direct access to video
export async function testVideoAccess(jobId: string): Promise<boolean> {
  const videoUrl = getVideoUrl(jobId);
  console.log("Testing direct video access:", videoUrl);
  
  try {
    const response = await fetch(videoUrl, { method: 'HEAD' });
    console.log("Video HEAD response:", response.status);
    return response.ok;
  } catch (err) {
    console.error("Error testing video access:", err);
    return false;
  }
}