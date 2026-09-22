import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DemoStore } from "@/lib/demo-store";

// DELETE: Delete or Cancel a post
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    try {
      const post = await prisma.scheduledPost.findUnique({
        where: { id }
      });

      if (post) {
        if (post.status === "processing") {
          return NextResponse.json({ error: "Cannot delete a post that is currently uploading." }, { status: 400 });
        }
        await prisma.scheduledPost.delete({
          where: { id }
        });
      } else {
        DemoStore.deletePost(id);
      }
    } catch (dbErr) {
      DemoStore.deletePost(id);
    }

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("[DELETE_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Reschedule or Retry a post
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    try {
      const post = await prisma.scheduledPost.findUnique({
        where: { id }
      });

      if (post) {
        if (post.status === "processing") {
          return NextResponse.json({ error: "Cannot modify a post that is currently uploading." }, { status: 400 });
        }

        const updateData = {};
        if (body.scheduledAt) {
          updateData.scheduledAt = new Date(body.scheduledAt);
          updateData.status = "scheduled";
          updateData.error = null;
        }

        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.privacy !== undefined) updateData.privacy = body.privacy;

        const updatedPost = await prisma.scheduledPost.update({
          where: { id },
          data: updateData
        });

        return NextResponse.json(updatedPost);
      }
    } catch (dbErr) {
      console.warn("[PATCH_POST_FALLBACK] DB offline, updating DemoStore:", dbErr.message);
    }

    // Fallback store update
    const updated = DemoStore.updatePost(id, body);
    return NextResponse.json(updated || { id, ...body });
  } catch (error) {
    console.error("[PATCH_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

