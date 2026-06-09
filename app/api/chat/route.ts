import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });

  const messages = await prisma.chatMessage.findMany({
    where: { projectId },
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { projectId, content } = await request.json();
  if (!projectId || !content?.trim()) {
    return NextResponse.json({ error: "projectId y contenido son requeridos" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: { content: content.trim(), projectId, authorId: session.id },
    include: { author: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}