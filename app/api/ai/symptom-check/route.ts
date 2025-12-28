import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { symptoms } = await request.json();
  
  // Simple symptom analysis
  const analysis = {
    symptoms,
    recommendation: 'Consider consulting a healthcare professional',
    urgency: 'medium'
  };

  return NextResponse.json(analysis);
}