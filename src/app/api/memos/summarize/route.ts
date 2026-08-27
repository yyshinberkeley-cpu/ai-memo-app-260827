import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const GEMINI_MODEL = 'gemini-3.1-flash-lite'

interface SummarizeRequestBody {
  title?: unknown
  content?: unknown
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  let body: SummarizeRequestBody
  try {
    body = (await request.json()) as SummarizeRequestBody
  } catch {
    return NextResponse.json(
      { error: '요청 본문을 읽을 수 없습니다.' },
      { status: 400 }
    )
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''

  if (!title || !content) {
    return NextResponse.json(
      { error: '제목과 내용을 모두 전달해야 합니다.' },
      { status: 400 }
    )
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        '다음 메모를 한국어로 2~4문장으로 요약하세요.',
        '핵심만 남기고, 원문에 없는 정보는 추가하지 마세요.',
        `제목: ${title}`,
        `내용:\n${content}`,
      ].join('\n\n'),
    })

    const summary = response.text?.trim()
    if (!summary) {
      return NextResponse.json(
        { error: '요약 결과를 생성하지 못했습니다.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Gemini summarize error:', error)
    return NextResponse.json(
      { error: '메모 요약 중 오류가 발생했습니다.' },
      { status: 502 }
    )
  }
}
