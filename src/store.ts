import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchPosts,
  isSupabaseConfigured,
  createPost as sbCreatePost,
  deletePost as sbDeletePost,
  updatePostStatus as sbUpdatePostStatus,
  subscribeToPosts,
} from "./lib/supabase";
import { mockPosts } from "./mockData";
import type { Category, Post, PostType } from "./types";

export type ViewMode = "map" | "list";
export type FilterType = "all" | PostType;

interface AppState {
  posts: Post[];
  viewMode: ViewMode;
  filterType: FilterType;
  filterCategory: Category | "all";
  searchQuery: string;
  selectedPostId: string | null;
  isNewPostModalOpen: boolean;
  isSynced: boolean;

  setViewMode: (mode: ViewMode) => void;
  setFilterType: (type: FilterType) => void;
  setFilterCategory: (cat: Category | "all") => void;
  setSearchQuery: (q: string) => void;
  selectPost: (id: string | null) => void;
  openNewPostModal: () => void;
  closeNewPostModal: () => void;
  addPost: (post: Omit<Post, "id" | "createdAt" | "status">) => Post;
  resolvePost: (id: string, secretCode: string) => boolean;
  deletePost: (id: string, secretCode: string) => boolean;
  loadPosts: () => void;
  initSupabaseSync: () => () => void;
  upsertPost: (post: Post) => void;
  removePost: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      posts: mockPosts,
      viewMode: "map",
      filterType: "all",
      filterCategory: "all",
      searchQuery: "",
      selectedPostId: null,
      isNewPostModalOpen: false,
      isSynced: false,

      setViewMode: (mode) => set({ viewMode: mode }),
      setFilterType: (type) => set({ filterType: type }),
      setFilterCategory: (cat) => set({ filterCategory: cat }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectPost: (id) => set({ selectedPostId: id }),
      openNewPostModal: () => set({ isNewPostModalOpen: true }),
      closeNewPostModal: () => set({ isNewPostModalOpen: false }),

      addPost: (data) => {
        const localId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const post: Post = {
          ...data,
          id: localId,
          createdAt: new Date().toISOString(),
          status: "active",
        };
        set((state) => ({ posts: [post, ...state.posts] }));

        if (isSupabaseConfigured) {
          sbCreatePost(data)
            .then((remotePost) => {
              if (remotePost) {
                set((state) => ({
                  posts: state.posts
                    .filter((p) => p.id !== localId)
                    .map((p) => (p.id === remotePost.id ? remotePost : p)),
                }));
                if (!get().posts.some((p) => p.id === remotePost.id)) {
                  set((state) => ({ posts: [remotePost, ...state.posts] }));
                }
              }
            })
            .catch((e) => console.error("[addPost] supabase error", e));
        }
        return post;
      },

      resolvePost: (id, secretCode) => {
        const post = get().posts.find((p) => p.id === id);
        console.log("[resolvePost]", {
          id,
          secretCode,
          found: !!post,
          postCode: post?.secretCode,
        });
        if (!post || post.secretCode !== secretCode) return false;
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, status: "resolved" as const } : p,
          ),
        }));
        if (isSupabaseConfigured) {
          sbUpdatePostStatus(id, secretCode, "resolved").catch((e) =>
            console.error("[resolvePost] supabase error", e),
          );
        }
        return true;
      },

      deletePost: (id, secretCode) => {
        const post = get().posts.find((p) => p.id === id);
        console.log("[deletePost]", {
          id,
          secretCode,
          found: !!post,
          postCode: post?.secretCode,
        });
        if (!post || post.secretCode !== secretCode) return false;
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
        if (isSupabaseConfigured) {
          sbDeletePost(id, secretCode).catch((e) =>
            console.error("[deletePost] supabase error", e),
          );
        }
        return true;
      },

      loadPosts: () => {
        const stored = get().posts;
        if (!stored || stored.length === 0) {
          set({ posts: mockPosts });
        }
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
        if (!isSupabaseConfigured) return () => {};

        fetchPosts()
          .then((remotePosts) => {
            if (remotePosts.length > 0) {
              set({ posts: remotePosts, isSynced: true });
              localStorage.removeItem("gironde-entraide-store");
            } else {
              set({ isSynced: true });
            }
          })
          .catch(() => {});

        const unsub = subscribeToPosts(
          (post) => get().upsertPost(post),
          (post) => get().upsertPost(post),
          (id) => get().removePost(id),
        );

        return unsub;
      },
    }),
    {
      name: "gironde-entraide-store",
      partialize: (state) => (state.isSynced ? {} : { posts: state.posts }),
    },
  ),
);

export interface FilterParams {
  posts: Post[];
  filterType: FilterType;
  filterCategory: Category | "all";
  searchQuery: string;
}

export function getFilteredPosts({
  posts,
  filterType,
  filterCategory,
  searchQuery,
}: FilterParams): Post[] {
  return posts.filter((p) => {
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
}
