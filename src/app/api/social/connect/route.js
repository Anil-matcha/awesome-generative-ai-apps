import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import config from "@/lib/config";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { platform, accountName = "", redirectUrl } = await req.json();
    const apiKey = config.ai.apiKey;

    if (!apiKey) {
      return NextResponse.json({ error: "MUAPIAPP_API_KEY is not configured" }, { status: 500 });
    }

    const extUserId = session.user.email;
    const finalRedirect = redirectUrl || `${config.auth.url}/integrations`;
    const plat = (platform || "").toLowerCase().replace("x_twitter", "x");

    // Check if platform has a dedicated developer connect-url endpoint in MuAPI
    const connectUrlPlatforms = ["youtube", "tiktok", "instagram", "facebook"];
    if (connectUrlPlatforms.includes(plat)) {
      try {
        const endpoint = `https://api.muapi.ai/api/v1/social/${plat}/connect-url`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          },
          body: JSON.stringify({
            external_user_id: extUserId,
            redirect_to: finalRedirect
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            return NextResponse.json({ url: data.url });
          }
        }
      } catch (err) {
        console.warn(`[CONNECT_URL_FALLBACK] Failed for ${plat}:`, err.message);
      }
    }

    // Direct connect URL route via MuAPI social router
    const encodedName = encodeURIComponent(accountName || `${plat.toUpperCase()} Account`);
    const encodedRedirect = encodeURIComponent(finalRedirect);
    const directUrl = `https://muapi.ai/api/social/${plat}/connect?account_name=${encodedName}&redirect_to=${encodedRedirect}`;

    return NextResponse.json({ url: directUrl });
  } catch (error) {
    console.error("[SOCIAL_CONNECT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
