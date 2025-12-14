import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/env";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey
);

// Types
export interface Session {
  id: string;
  userId: string;
  title: string;
  mode: "default" | "data-analysis" | "data-preparation";
  currentDataVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  artifacts?: Record<string, any>;
  createdAt: string;
}

export interface DataVersion {
  id: string;
  sessionId: string;
  version: string;
  fileName: string;
  fileUrl: string;
  fileSize?:  number;
  description?: string;
  createdAt: string;
}

// ============ SESSION OPERATIONS ============

export async function createSession(
  userId: string,
  title: string,
  mode: "default" | "data-analysis" | "data-preparation"
): Promise<Session> {
  const sessionId = uuidv4();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      id: sessionId,
      userId:  userId,
      title,
      mode,
      currentDataVersion:  "v0",
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Create session error:", error);
    throw new Error(`Failed to create session: ${error. message}`);
  }

  return data as Session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get session: ${error.message}`);
  }

  return data as Session | null;
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error(`Failed to get sessions: ${error.message}`);
  }

  return data as Session[];
}

// ============ MESSAGE OPERATIONS ============

export async function createMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  artifacts?: Record<string, any>
): Promise<Message> {
  const messageId = uuidv4();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      id: messageId,
      sessionId,
      role,
      content,
      artifacts:  artifacts || null,
      createdAt: now,
    })
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Create message error:", error);
    throw new Error(`Failed to create message: ${error.message}`);
  }

  return data as Message;
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("sessionId", sessionId)
    .order("createdAt", { ascending: true });

  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }

  return data as Message[];
}

// ============ DATA VERSION OPERATIONS ============

export async function createDataVersion(
  sessionId: string,
  version: string,
  fileName: string,
  fileUrl: string,
  fileSize?: number,
  description?: string
): Promise<DataVersion> {
  const versionId = uuidv4();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("dataVersions")
    .insert({
      id: versionId,
      sessionId,
      version,
      fileName,
      fileUrl,
      fileSize:  fileSize || null,
      description:  description || null,
      createdAt: now,
    })
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Create data version error:", error);
    throw new Error(`Failed to create data version: ${error.message}`);
  }

  return data as DataVersion;
}

export async function getLatestDataVersion(
  sessionId: string
): Promise<DataVersion | null> {
  const { data, error } = await supabase
    .from("dataVersions")
    .select("*")
    .eq("sessionId", sessionId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get latest data version: ${error.message}`);
  }

  return data as DataVersion | null;
}

export async function getSessionDataVersions(
  sessionId: string
): Promise<DataVersion[]> {
  const { data, error } = await supabase
    .from("dataVersions")
    .select("*")
    .eq("sessionId", sessionId)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error(`Failed to get data versions: ${error.message}`);
  }

  return data as DataVersion[];
}

// ============ FILE STORAGE OPERATIONS ============

export async function uploadFileToStorage(
  sessionId: string,
  fileName: string,
  fileBuffer: Buffer,
  version: string = "v0"
): Promise<{ fileUrl: string; fileKey: string }> {
  const fileKey = `${sessionId}/${version}/${fileName}`;

  const { error } = await supabase.storage
    .from(config.supabaseStorageBucket)
    .upload(fileKey, fileBuffer, {
      contentType: "text/csv",
      upsert: true,
    });

  if (error) {
    console.error("[Supabase] File upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from(config.supabaseStorageBucket)
    .getPublicUrl(fileKey);

  return {
    fileUrl: data.publicUrl,
    fileKey,
  };
}

export async function downloadFileFromStorage(fileKey: string): Promise<Buffer> {
  const { data, error } = await supabase. storage
    .from(config. supabaseStorageBucket)
    .download(fileKey);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

// ============ HEALTH CHECK ============

export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase. from("sessions").select("id").limit(1);
    return ! error;
  } catch {
    return false;
  }
}