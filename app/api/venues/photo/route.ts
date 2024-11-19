import { NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_PHOTO_URL = 'https://places.googleapis.com/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoName = searchParams.get('name');
    
    if (!photoName) {
      return NextResponse.json({ error: 'Photo name is required' }, { status: 400 });
    }

    const response = await fetch(`${GOOGLE_PLACES_PHOTO_URL}/${photoName}/media`, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
      }
    });

    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'image/jpeg'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}