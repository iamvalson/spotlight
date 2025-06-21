import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";


export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
});



export const createPost = mutation({
    args: {
        caption: v.optional(v.string()),
        storageId: v.id("_storage"),
    },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) throw new Error("Image not found");


        // Create the post 

        const postId = await ctx.db.insert("posts", {
            userId: currentUser._id,
            imageUrl,
            storageId: args.storageId,
            caption: args.caption,
            likes: 0,
            comments: 0,
        })

        // Update the user's posts count
        await ctx.db.patch(currentUser._id, {
            posts: currentUser.posts + 1,
        })

        return postId;
    },
});

export const getFeedPosts = query({
    args: {
        version: v.optional(v.number()),
    },
    handler: async (ctx, args) => {

        const currentUser = await getAuthenticatedUser(ctx);

        // get all posts
        const posts = await ctx.db.query("posts").order("desc").collect();

        if (posts.length === 0) return [];

        
        // enhance posts with userdata and interaction status
        const postWithInfo = await Promise.all(
            posts.map(async(post) => {
                const postAuthor = (await ctx.db.get(post.userId))!;

                const like = await ctx.db.query('likes')
                .withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", post._id)).first();

                const bookmark = await ctx.db.query("bookmarks").withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", post._id)).first();

                return {
                    ...post,
                    author: {
                        _id: postAuthor?._id,
                        username: postAuthor?.username,
                        image: postAuthor?.image
                    },
                    isLiked: !!like,
                    isBookmarked:!!bookmark,
                }
            })
        );

        return postWithInfo;
    }
})

export const toggleLike = mutation({
    args:{postId: v.id("posts")},
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const existing = await ctx.db
        .query("likes")
        .withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId)).first();

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        if(existing) {
            //remove like
            await ctx.db.delete(existing._id);
            await ctx.db.patch(args.postId, {likes: post.likes - 1});
            return false; //unliked
        } else {
            // add like
            await ctx.db.insert("likes", {
                userId: currentUser._id,
                postId: args.postId,
            });
            await ctx.db.patch(args.postId, {likes: post.likes + 1});

            // If its not my post create a notification
            if (currentUser._id !== post.userId) {
                await ctx.db.insert("notifications", {
                    recieverId: post.userId,
                    senderId: currentUser._id,
                    type: "like",
                    postId: args.postId,
                });
            }

            return true // this is liked
        }
    }
})


export const deletePost = mutation({
    args: {postId: v.id("posts")},
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        if (post.userId !== currentUser._id) throw new Error("Unauthorized");

        // delete post

        const likes = await ctx.db.query("likes").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();

        for (const like of likes) {
            await ctx.db.delete(like._id);
        }

        const comments = await ctx.db.query("comments").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        // delete associated bookmarks
        const bookmarks = await ctx.db.query("bookmarks").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();

        for (const bookmark of bookmarks) {
            await ctx.db.delete(bookmark._id);
        }

        const notifications = await ctx.db.query("notifications").withIndex("by_reciever", (q) => q.eq("recieverId", currentUser._id)).collect();

        for (const notification of notifications) {
            await ctx.db.delete(notification._id);
        }

        // delete post from storage
        await ctx.storage.delete(post.storageId);

        // delete post
        await ctx.db.delete(args.postId);


        // decrement user post count by 1
        await ctx.db.patch(currentUser._id, {posts: Math.max(0, (currentUser.posts || 1) - 1),});
        
        
    }
})


export const getPostByUser = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const user = args.userId ? await ctx.db.get(args.userId) : await getAuthenticatedUser(ctx);

        if (!user) throw new Error("User not found");

        const posts = await ctx.db.query("posts").withIndex("by_user", (q) => q.eq("userId", args.userId || user._id)).collect();

        return posts;
    }
})