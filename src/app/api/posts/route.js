import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserService } from "@/lib/services/user";
import config from "@/lib/config";
import { DemoStore } from "@/lib/demo-store";

// Helper function to call the MuAPI publishing endpoints
async function triggerMuApiPublish(platform, payload) {
  const apiKey = config.ai.apiKey;
  const plat = (platform || "").toLowerCase().replace("x_twitter", "x");

  const endpointMap = {
    youtube: "https://api.muapi.ai/api/v1/youtube-publish",
    tiktok: "https://api.muapi.ai/api/v1/tiktok-publish",
    instagram: "https://api.muapi.ai/api/v1/instagram-publish",
    x: "https://api.muapi.ai/api/v1/x-publish",
    facebook: "https://api.muapi.ai/api/v1/facebook-publish",
    linkedin: "https://api.muapi.ai/api/v1/linkedin-publish",
    threads: "https://api.muapi.ai/api/v1/threads-publish",
    pinterest: "https://api.muapi.ai/api/v1/pinterest-publish",
  };

  const endpoint = endpointMap[plat] || endpointMap.youtube;

  const captionText = [
    payload.title,
    payload.description,
    payload.tags ? payload.tags.split(",").map(t => t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`).join(" ") : ""
  ].filter(Boolean).join("\n\n");

  const bodyData = {
    account_id: parseInt(payload.accountId),
    media_url: payload.mediaUrl
  };

  if (plat === "youtube") {
    bodyData.title = payload.title || "Untitled Video";
    bodyData.description = payload.description || "";
    bodyData.tags = payload.tags ? payload.tags.split(",").map(t => t.trim()) : [];
    bodyData.privacy = payload.privacy || "public";
    if (payload.categoryId) bodyData.category_id = payload.categoryId;
    bodyData.made_for_kids = payload.madeForKids || false;
  } else if (plat === "tiktok") {
    bodyData.title = payload.title || captionText;
    bodyData.privacy_level = payload.privacy || "PUBLIC_TO_EVERYONE";
    bodyData.disable_comment = payload.disableComment || false;
    bodyData.disable_duet = payload.disableDuet || false;
    bodyData.disable_stitch = payload.disableStitch || false;
  } else if (plat === "instagram") {
    bodyData.caption = captionText;
    bodyData.placement = "reels";
    bodyData.share_to_feed = true;
  } else if (plat === "x") {
    bodyData.caption = captionText.substring(0, 280);
    bodyData.reply_settings = "everyone";
  } else if (plat === "facebook") {
    bodyData.caption = captionText;
    bodyData.placement = "timeline";
  } else if (plat === "linkedin") {
    bodyData.caption = captionText;
  } else if (plat === "threads") {
    bodyData.caption = captionText.substring(0, 500);
    bodyData.placement = "timeline";
  } else if (plat === "pinterest") {
    bodyData.title = payload.title || "Untitled Pin";
    bodyData.caption = payload.description || captionText;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(bodyData)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`MuAPI submission failed: ${errText}`);
  }

  const data = await res.json();
  return data.request_id || data.id; // Returns request_id
}

// GET: List posts + Process Due Posts + Poll Status
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch current posts from database with fallback
    let posts = [];
    try {
      posts = await prisma.scheduledPost.findMany({
        where: { userId },
        orderBy: { scheduledAt: "desc" }
      });
    } catch (dbErr) {
      console.warn("[POSTS_GET_FALLBACK] Database offline, returning DemoStore posts:", dbErr.message);
      return NextResponse.json(DemoStore.getPosts());
    }

    const now = new Date();
    let dbUpdated = false;

    // 2. Trigger Due Scheduled Posts
    const duePosts = posts.filter(p => p.status === "scheduled" && new Date(p.scheduledAt) <= now);
    for (const post of duePosts) {
      try {
        // Deduct 1 credit for publishing
        await UserService.deductCredits(userId, config.ai.generationCost);
        
        // Trigger post
        const requestId = await triggerMuApiPublish(post.platform, {
          accountId: post.accountId,
          mediaUrl: post.mediaUrl,
          title: post.title,
          description: post.description,
          tags: post.tags,
          privacy: post.privacy,
          disableComment: post.disableComment,
          disableDuet: post.disableDuet,
          disableStitch: post.disableStitch,
          categoryId: post.categoryId,
          madeForKids: post.madeForKids
        });

        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: "processing",
            requestId: requestId
          }
        });
        dbUpdated = true;
      } catch (err) {
        console.error(`Failed to trigger due post ${post.id}:`, err);
        
        // Set post to failed
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: "failed",
            error: err.message || "Failed to trigger scheduled post"
          }
        });
        dbUpdated = true;
      }
    }

    // 3. Poll Processing Posts
    const processingPosts = posts.filter(p => p.status === "processing" && p.requestId);
    for (const post of processingPosts) {
      try {
        const apiKey = config.ai.apiKey;
        const res = await fetch(`https://api.muapi.ai/api/v1/predictions/${post.requestId}/result`, {
          headers: { "x-api-key": apiKey }
        });

        if (res.ok) {
          const result = await res.json();
          const status = result.status || result.state;

          if (status === "completed" || status === "succeeded") {
            const output = result.output || {};
            const publishedUrl = output.url || output.x_url || output.instagram_url || output.facebook_url || output.linkedin_url || output.threads_url || output.pinterest_url || (output.publish_id ? `https://${post.platform}.com/post/${output.publish_id}` : null);
            
            await prisma.scheduledPost.update({
              where: { id: post.id },
              data: {
                status: "completed",
                publishedUrl: publishedUrl || "Published successfully",
                publishResult: JSON.stringify(output),
                publishedAt: new Date()
              }
            });
            dbUpdated = true;
          } else if (status === "failed") {
            const errorMsg = result.error || "Publishing failed";
            await prisma.scheduledPost.update({
              where: { id: post.id },
              data: {
                status: "failed",
                error: errorMsg
              }
            });

            // Refund credits
            await UserService.addCredits(userId, config.ai.generationCost);
            dbUpdated = true;
          }
        }
      } catch (err) {
        console.error(`Failed to poll status for post ${post.id}:`, err);
      }
    }

    // If database was modified, re-fetch posts list to return fresh data
    if (dbUpdated) {
      posts = await prisma.scheduledPost.findMany({
        where: { userId },
        orderBy: { scheduledAt: "desc" }
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[GET_POSTS_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Schedule or Publish Immediately
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      accountId,
      platform,
      accountName,
      mediaUrl,
      title,
      description,
      tags,
      privacy,
      scheduledAt,
      disableComment,
      disableDuet,
      disableStitch,
      categoryId,
      madeForKids
    } = body;

    if (!accountId || !platform || !mediaUrl) {
      return NextResponse.json({ error: "Missing required fields: accountId, platform, and mediaUrl are mandatory." }, { status: 400 });
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      });
    } catch (e) {
      console.warn("[POSTS_USER_CREDITS_FALLBACK] DB unreachable, using default credits");
      user = { credits: 50 };
    }

    const cost = config.ai.generationCost;
    if (user && user.credits < cost) {
      return NextResponse.json({ error: `Insufficient credits. This operation costs ${cost} credits but you have ${user?.credits ?? 0}.` }, { status: 400 });
    }

    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();

    if (isScheduled) {
      // Create scheduled post
      try {
        const post = await prisma.scheduledPost.create({
          data: {
            userId,
            accountId: parseInt(accountId),
            platform,
            accountName: accountName || `${platform} Account`,
            mediaUrl,
            title: title || "",
            description: description || "",
            tags: tags || "",
            privacy: privacy || "public",
            disableComment: !!disableComment,
            disableDuet: !!disableDuet,
            disableStitch: !!disableStitch,
            categoryId: categoryId || null,
            madeForKids: !!madeForKids,
            scheduledAt: new Date(scheduledAt),
            status: "scheduled"
          }
        });
        return NextResponse.json(post);
      } catch (dbErr) {
        console.warn("[POST_CREATE_FALLBACK] DB offline, saving to DemoStore:", dbErr.message);
        const post = DemoStore.addPost({
          userId,
          accountId: parseInt(accountId),
          platform,
          accountName: accountName || `${platform} Account`,
          mediaUrl,
          title: title || "",
          description: description || "",
          tags: tags || "",
          privacy: privacy || "public",
          disableComment: !!disableComment,
          disableDuet: !!disableDuet,
          disableStitch: !!disableStitch,
          categoryId: categoryId || null,
          madeForKids: !!madeForKids,
          scheduledAt: new Date(scheduledAt).toISOString(),
          status: "scheduled"
        });
        return NextResponse.json(post);
      }
    } else {
      // Immediate publish
      try {
        await UserService.deductCredits(userId, cost);
      } catch (e) {}

      try {
        // Submit to MuAPI if API key is present
        let requestId = "req_" + Date.now();
        if (config.ai.apiKey && !config.ai.apiKey.includes("your_")) {
          requestId = await triggerMuApiPublish(platform, {
            accountId,
            mediaUrl,
            title,
            description,
            tags,
            privacy,
            disableComment,
            disableDuet,
            disableStitch,
            categoryId,
            madeForKids
          });
        }

        try {
          const post = await prisma.scheduledPost.create({
            data: {
              userId,
              accountId: parseInt(accountId),
              platform,
              accountName: accountName || `${platform} Account`,
              mediaUrl,
              title: title || "",
              description: description || "",
              tags: tags || "",
              privacy: privacy || "public",
              disableComment: !!disableComment,
              disableDuet: !!disableDuet,
              disableStitch: !!disableStitch,
              categoryId: categoryId || null,
              madeForKids: !!madeForKids,
              scheduledAt: new Date(),
              status: "processing",
              requestId: requestId
            }
          });
          return NextResponse.json(post);
        } catch (dbErr) {
          console.warn("[POST_IMMEDIATE_FALLBACK] DB offline, saving to DemoStore");
          const post = DemoStore.addPost({
            userId,
            accountId: parseInt(accountId),
            platform,
            accountName: accountName || `${platform} Account`,
            mediaUrl,
            title: title || "",
            description: description || "",
            tags: tags || "",
            privacy: privacy || "public",
            scheduledAt: new Date().toISOString(),
            status: "completed",
            requestId: requestId,
            publishedUrl: `https://${platform}.com/sample_post`
          });
          return NextResponse.json(post);
        }
      } catch (err) {
        try { await UserService.addCredits(userId, cost); } catch (e) {}
        throw err;
      }
    }
  } catch (error) {
    console.error("[POST_POSTS_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
