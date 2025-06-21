import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";


// Create a new task with the given text
export const createUser = mutation({
    args:{
        username: v.string(), //johndoe
        fullname: v.string(), //John Doe
        email: v.string(),
        bio: v.optional(v.string()),
        image: v.string(),
        clerkId: v.string(),
    },

    handler: async(ctx, args) => {

        const existingUser = await ctx.db.query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first()

        if (existingUser) return


        // Create a user in db

        await ctx.db.insert('users', {
            username: args.username,
            fullname: args.fullname,
            email: args.email,
            bio: args.bio,
            image: args.image,
            clerkId: args.clerkId,
            followers: 0,
            following: 0,
            posts: 0,
        })
    }
});


export const updateProfile = mutation({
    args: {
        fullname: v.string(),
        bio: v.string(),
    },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        await ctx.db.patch(currentUser._id, {
            fullname: args.fullname,
            bio: args.bio,
        })
    }
})


export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
});

export const changeProfilePhoto = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        // Get the URL for the uploaded image
        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) {
            throw new Error("Failed to get image URL from storage");
        }

        // Update the user's profile with the new image URL
        await ctx.db.patch(currentUser._id, {
            image: imageUrl,
        });

        return { success: true, imageUrl };
    }
})



export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx){
    const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).first();

        if (!currentUser) throw new Error("User not found");

    return currentUser;
}


export const getUserByClerkId = query({
    args: {clerkId: v.string()},
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)).unique();
        return user;
    }
})


export const getUserProfile = query({
    args: {id: v.id("users")},
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user) throw new Error("User not found");
        
        return user;
    }
})

export const isFollowing = query({
    args: {followingId: v.id("users")},
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const follow = await ctx.db
        .query("follows")
        .withIndex("by_both", (q) => q.eq("followerId", currentUser._id).eq("followingId", args.followingId)).first();

        return !!follow;
    }

    
})

export const toggleFollow = mutation({
    args: {followingId: v.id("users")},
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const existing = await ctx.db
        .query("follows")
        .withIndex("by_both", (q) => q.eq("followerId", currentUser._id).eq("followingId", args.followingId)).first();

        const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_reciever", (q) => q.eq("recieverId", args.followingId))
        .filter((n) => n.eq(n.field("senderId"), currentUser._id) && n.eq(n.field("type"), "follow"))
        .first();

        if(existing){
            // unfollow
            await ctx.db.delete(existing._id);
            await updateFollowCounts(ctx, currentUser._id, args.followingId, false)

             // delete a notification
             if(notifications){
                await ctx.db.delete(notifications._id);
             }

        } else {
            // follow
            await ctx.db.insert("follows", {
                followerId: currentUser._id,
                followingId: args.followingId,
            })

            await updateFollowCounts(ctx, currentUser._id, args.followingId, true)

            // create a notification
            await ctx.db.insert("notifications", {
                recieverId: args.followingId,
                senderId: currentUser._id,
                type: "follow",
            })
        }
    }
})


async function updateFollowCounts(
    ctx: MutationCtx,
    followerId: Id<"users">,
    followingId: Id<"users">,
    isFollow: boolean
){
    const follower = await ctx.db.get(followerId);
    const following = await ctx.db.get(followingId);

    if (follower && following){
        await ctx.db.patch(followerId, {
            following: follower.following + (isFollow ? 1 : -1),
        })
        await ctx.db.patch(followingId, {
            followers: following.followers + (isFollow ? 1 : -1),
        })
    }
}


