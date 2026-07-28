import type { Category, Post, PostType } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

async function supabaseFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase non configuré — vérifiez .env");
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase error: ${res.status} ${res.statusText}`);
  }
  return res;
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await supabaseFetch(
    "/posts?select=id,type,category,title,description,capacity,lat,lng,location_name,urgent,image_url,status,created_at&order=created_at.desc",
  );
  const rows = await res.json();
  return rows.map(mapDbToPost);
}

export async function fetchPostContact(id: string): Promise<string> {
  const res = await supabaseFetch(`/posts?select=contact&id=eq.${id}`);
  const rows = await res.json();
  return (rows[0]?.contact as string) || "";
}

export async function cleanupResolvedPosts(): Promise<void> {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  await supabaseFetch(
    `/posts?status=eq.resolved&created_at=lt.${sevenDaysAgo}`,
    { method: "DELETE" },
  );
}

export async function fetchSiteLocked(): Promise<boolean> {
  try {
    const res = await supabaseFetch("/site_settings?select=locked&id=eq.1");
    const rows = await res.json();
    return rows[0]?.locked === true;
  } catch {
    return false;
  }
}

export async function createAlert(data: {
  email: string;
  filterType: string;
  category: string;
  lat: number;
  lng: number;
  radiusKm: number;
  postId?: string;
}): Promise<void> {
  await supabaseFetch("/alerts", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      filter_type: data.filterType,
      category: data.category,
      lat: data.lat,
      lng: data.lng,
      radius_km: data.radiusKm,
      post_id: data.postId || null,
    }),
  });
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "status">,
): Promise<Post | null> {
  const res = await supabaseFetch(
    "/posts?select=id,type,category,title,description,capacity,lat,lng,location_name,contact,urgent,image_url,status,created_at",
    {
      method: "POST",
      body: JSON.stringify({
        type: data.type,
        category: data.category,
        title: data.title,
        description: data.description,
        capacity: data.capacity,
        lat: data.lat,
        lng: data.lng,
        location_name: data.locationName,
        contact: data.contact,
        secret_code: data.secretCode,
        urgent: data.urgent,
        image_url: data.imageUrl || null,
        status: "active",
      }),
      headers: { Prefer: "return=representation" },
    },
  );
  const rows = await res.json();
  return rows[0] ? mapDbToPost(rows[0]) : null;
}

export async function updatePostStatus(
  id: string,
  secretCode: string,
  status: "active" | "resolved",
): Promise<boolean> {
  const res = await supabaseFetch(
    `/posts?id=eq.${id}&secret_code=eq.${secretCode}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      headers: { Prefer: "return=representation" },
    },
  );
  if (!res.ok) return false;
  const rows = await res.json();
  return rows.length > 0;
}

export async function deletePost(
  id: string,
  secretCode: string,
): Promise<boolean> {
  const res = await supabaseFetch(
    `/posts?id=eq.${id}&secret_code=eq.${secretCode}`,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  if (!res.ok) return false;
  const rows = await res.json();
  if (rows.length === 0) return false;

  const imageUrl = rows[0].image_url as string | null;
  if (imageUrl) {
    try {
      const path = imageUrl.split("/posts-images/")[1];
      if (path) {
        await fetch(`${SUPABASE_URL}/storage/v1/object/posts-images/${path}`, {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
      }
    } catch {
      // Image deletion failed, but post is already deleted
    }
  }
  return true;
}

async function compressImage(
  file: File,
  maxW = 800,
  quality = 0.8,
): Promise<File> {
  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  let { width, height } = img;
  if (width > maxW) {
    height = Math.round((height * maxW) / width);
    width = maxW;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
  );
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

export async function uploadPostImage(file: File): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) return null;
  if (file.size > 2 * 1024 * 1024) return null;

  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed);

  const fileName = `${crypto.randomUUID()}.jpg`;
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/posts-images/${fileName}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: formData,
    },
  );
  if (!res.ok) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/posts-images/${fileName}`;
}

export function subscribeToPosts(
  onInsert: (post: Post) => void,
  onUpdate: (post: Post) => void,
  onDelete: (id: string) => void,
): () => void {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return () => {};

  const wsUrl = `${SUPABASE_URL!.replace("https", "wss")}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;
  let ws: WebSocket | null = null;
  let closed = false;

  function connect() {
    if (closed) return;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws?.send(
        JSON.stringify({
          topic: "realtime:public:posts",
          event: "phx_join",
          payload: {},
          ref: "1",
        }),
      );
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.event === "INSERT" && msg.payload?.record) {
          onInsert(mapDbToPost(msg.payload.record));
        } else if (msg.event === "UPDATE" && msg.payload?.record) {
          onUpdate(mapDbToPost(msg.payload.record));
        } else if (msg.event === "DELETE" && msg.payload?.old_record) {
          onDelete(msg.payload.old_record.id as string);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      if (!closed) {
        setTimeout(connect, 3000);
      }
    };
  }

  connect();

  return () => {
    closed = true;
    ws?.close();
  };
}

function mapDbToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    type: row.type as PostType,
    category: row.category as Category,
    title: row.title as string,
    description: (row.description as string) || "",
    capacity: (row.capacity as number) || 0,
    lat: row.lat as number,
    lng: row.lng as number,
    locationName: (row.location_name as string) || "",
    contact: (row.contact as string) || "",
    urgent: (row.urgent as boolean) || false,
    imageUrl: (row.image_url as string) || undefined,
    status: (row.status as "active" | "resolved") || "active",
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}
