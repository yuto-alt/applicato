export async function GET(request) {
  const apiKey = process.env.HOTPEPPER_API_KEY;

  // APIキーが正しく取得されているか確認
  console.log("API Key from environment:", apiKey);

  const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("API Response:", data);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("API request error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
