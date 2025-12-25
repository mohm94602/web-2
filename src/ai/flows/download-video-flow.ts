"use server";

export async function downloadVideoFlow(url: string) {
  // هنا تحط كل منطق تحميل الفيديوهات باستخدام RapidAPI
  const response = await fetch("https://mcp.rapidapi.com", {
    method: "POST",
    headers: {
      "x-api-host": "social-download-all-in-one.p.rapidapi.com",
      "x-api-key": process.env.RAPIDAPI_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: url }),
  });

  const data = await response.json();

  // استخرج الصيغ اللي تريدها
  const formats = data.formats || [];

  return {
    title: data.title || "Unknown",
    platform: data.platform || "Unknown",
    thumbnail: data.thumbnail || "",
    formats: formats,
  };
}
