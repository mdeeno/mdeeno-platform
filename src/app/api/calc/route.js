import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    
    const response = await fetch("https://prop-logic-engine.onrender.com/v1/calc", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // 💡 대표님 백엔드의 ALLOWED_ORIGINS에 있는 주소와 100% 일치하도록 위장!
        "Origin": "http://localhost:3000",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" 
      },
      body: JSON.stringify(body),
      cache: "no-store" // 🔥 Next.js의 지독한 에러 캐싱 강제 차단!
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🚨 Render 백엔드 에러:", response.status, errorText);
      return NextResponse.json(
        { error: "백엔드 에러", details: errorText }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("🚨 Next.js 내부 API 에러:", error);
    return NextResponse.json({ error: "서버 내부 연결 실패" }, { status: 500 });
  }
}