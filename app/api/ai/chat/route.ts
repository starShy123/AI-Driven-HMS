import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth';
import { createApiError } from '@/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        createApiError('Unauthorized', 401),
        { status: 401 }
      );
    }

    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        createApiError('Message is required', 400),
        { status: 400 }
      );
    }

    const response = await aiService.chat(message, typeof context === 'string' ? [context] : []);

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      createApiError('Failed to process AI request', 500),
      { status: 500 }
    );
  }
}