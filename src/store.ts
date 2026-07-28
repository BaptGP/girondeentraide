import { create } from "zustand";
import {
  fetchPosts,
  createPost as sbCreatePost,
  deletePost as sbDeletePost,
  updatePostStatus as sbUpdatePostStatus,
  subscribeToPosts,
} from "./lib/supabase";
import type { Category, Post, PostType } from "./types";

export type ViewMode = "map" | "list";
export type FilterType = "all" | PostType;

interface AppState {
  posts: Post[];
  viewMode: ViewMode;
  filterType: FilterType;
  filterCategory: Category | "all";
  searchQuery: string;
  sortByUrgent: boolean;
  selectedPostId: string | null;
  isNewPostModalOpen: boolean;
  isSynced: boolean;

  setViewMode: (mode: ViewMode) => void;
  setFilterType: (type: FilterType) => void;
  setFilterCategory: (cat: Category | "all") => void;
  setSearchQuery: (q: string) => void;
  setSortByUrgent: (v: boolean) => void;
  selectPost: (id: string | null) => void;
  openNewPostModal: () => void;
  closeNewPostModal: () => void;
  addPost: (
    data: Omit<Post, "id" | "createdAt" | "status">,
    onCreated?: (id: string) => void,
  ) => Post;
  resolvePost: (id: string, secretCode: string) => Promise<boolean>;
  deletePost: (id: string, secretCode: string) => Promise<boolean>;
  initSupabaseSync: () => () => void;
  upsertPost: (post: Post) => void;
  removePost: (id: string) => void;
}

export const useStore = create<AppState>()((set, get) => ({
  posts: [],
  viewMode: "map",
  filterType: "all",
  filterCategory: "all",
  searchQuery: "",
  sortByUrgent: false,
  selectedPostId: null,
  isNewPostModalOpen: false,
  isSynced: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setFilterType: (type) => set({ filterType: type }),
  setFilterCategory: (cat) => set({ filterCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortByUrgent: (v) => set({ sortByUrgent: v }),
  selectPost: (id) => set({ selectedPostId: id }),
  openNewPostModal: () => set({ isNewPostModalOpen: true }),
  closeNewPostModal: () => set({ isNewPostModalOpen: false }),

  addPost: (data, onCreated) => {
    const tempId = `temp-${Date.now()}`;
    const post: Post = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    set((state) => ({ posts: [post, ...state.posts] }));

    sbCreatePost(data)
      .then((remotePost) => {
        if (remotePost) {
          set((state) => ({
            posts: state.posts
              .filter((p) => p.id !== tempId)
              .map((p) => (p.id === remotePost.id ? remotePost : p)),
          }));
          if (!get().posts.some((p) => p.id === remotePost.id)) {
            set((state) => ({ posts: [remotePost, ...state.posts] }));
          }
          onCreated?.(remotePost.id);
        }
      })
      .catch((e) => {
        console.error("[addPost] supabase error", e);
        set((state) => ({ posts: state.posts.filter((p) => p.id !== tempId) }));
      });
    return post;
  },

  resolvePost: async (id, secretCode) => {
    const ok = await sbUpdatePostStatus(id, secretCode, "resolved");
    if (ok) {
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === id ? { ...p, status: "resolved" as const } : p,
        ),
      }));
    }
    return ok;
  },

  deletePost: async (id, secretCode) => {
    const ok = await sbDeletePost(id, secretCode);
    if (ok) {
      set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
    }
    return ok;
  },

  upsertPost: (post) => {
    set((state) => {
      const idx = state.posts.findIndex((p) => p.id === post.id);
      if (idx >= 0) {
        const posts = [...state.posts];
        posts[idx] = post;
        return { posts };
      }
      return { posts: [post, ...state.posts] };
    });
  },

  removePost: (id) => {
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },

  initSupabaseSync: () => {
    fetchPosts()
      .then((remotePosts) => {
        set({ posts: remotePosts, isSynced: true });
      })
      .catch((e) => {
        console.error("[initSupabaseSync] fetch error", e);
        set({ isSynced: false });
      });

    const unsub = subscribeToPosts(
      (post) => get().upsertPost(post),
      (post) => get().upsertPost(post),
      (id) => get().removePost(id),
    );

    return unsub;
  },
}));

export interface FilterParams {
  posts: Post[];
  filterType: FilterType;
  filterCategory: Category | "all";
  searchQuery: string;
  sortByUrgent: boolean;
}

export function getFilteredPosts({
  posts,
  filterType,
  filterCategory,
  searchQuery,
  sortByUrgent,
}: FilterParams): Post[] {
  const filtered = posts.filter((p) => {
    if (p.status === "resolved") return false;
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.locationName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
  if (sortByUrgent) {
    return [...filtered].sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return 0;
    });
  }
  return filtered;
}
