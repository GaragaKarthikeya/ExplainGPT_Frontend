import { NextRequest, NextResponse } from "next/server";
import { checkJobStatus, getVideoUrl } from "@/lib/manimApi";

/**
 * Animation Status API Route Handler
 * This endpoint checks the status of an animation generation job
 */

export async function GET(request: NextRequest) {
  // Extract jobId from query params
  const jobId = request.nextUrl.searchParams.get("jobId");
  
  if (!jobId) {
    return NextResponse.json({ success: false, error: "Missing job ID" }, { status: 400 });
  }
  
  try {
    // Check job status
    const result = await checkJobStatus(jobId);
    
    if (result.success) {
      // If status API reports success, use provided URL or generate one
      const videoUrl = result.video_url || getVideoUrl(jobId);
      return NextResponse.json({ success: true, videoUrl });
    } else if (result.error) {
      return NextResponse.json({ success: false, error: result.error });
    } else {
      // Still processing
      return NextResponse.json({ success: false, processing: true });
    }
  } catch (error) {
    console.error("Error checking animation status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check animation status" },
      { status: 500 }
    );
  }
}
