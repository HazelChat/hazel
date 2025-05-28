import type { Doc, Id } from "convex-hazel/_generated/dataModel"
import type { MutationCtx, QueryCtx } from "convex-hazel/_generated/server"
import type { UserIdentity } from "convex/server"

type GenericContext = QueryCtx | MutationCtx

export class User {
	private constructor(private readonly user: Doc<"users">) {}

	static async fromIdentity(ctx: GenericContext, identity: UserIdentity) {
		const user = await ctx.db
			.query("users")
			.withIndex("bg_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique()

		if (!user) throw new Error("User not found")

		return new User(user)
	}

	public async isMemberOfChannel(args: { ctx: GenericContext; channelId: Id<"serverChannels"> }) {
		const channelMember = await args.ctx.db
			.query("channelMembers")
			.filter((q) => q.eq(q.field("userId"), this.user._id))
			.filter((q) => q.eq(q.field("channelId"), args.channelId))
			.first()

		return channelMember != null
	}
	public async validateIsMemberOfChannel(args: { ctx: GenericContext; channelId: Id<"serverChannels"> }) {
		if (!(await this.isMemberOfChannel(args))) {
			throw new Error("You are not a member of this channel")
		}
	}

	public async isMemberOfServer({ ctx, serverId }: { ctx: GenericContext; serverId: Id<"servers"> }) {
		const serverMember = await ctx.db
			.query("serverMembers")
			.filter((q) => q.eq(q.field("userId"), this.user._id))
			.filter((q) => q.eq(q.field("serverId"), serverId))
			.first()

		return serverMember != null
	}
	public async validateIsMemberOfServer({ ctx, serverId }: { ctx: GenericContext; serverId: Id<"servers"> }) {
		if (!(await this.isMemberOfServer({ ctx, serverId }))) {
			throw new Error("You are not a member of this server")
		}
	}

	public async canViewChannel({ ctx, channelId }: { ctx: GenericContext; channelId: Id<"serverChannels"> }) {
		const channel = await ctx.db.get(channelId)
		if (!channel) throw new Error("Channel not found")

		return (
			(await this.isMemberOfChannel({ ctx, channelId })) ||
			((await this.isMemberOfServer({ ctx, serverId: channel.serverId })) && channel.type === "public")
		)
	}
	public async validateCanViewChannel({ ctx, channelId }: { ctx: GenericContext; channelId: Id<"serverChannels"> }) {
		if (!(await this.canViewChannel({ ctx, channelId }))) {
			throw new Error("You do not have access to this channel")
		}
	}

	public async ownsMessage({ ctx, messageId }: { ctx: GenericContext; messageId: Id<"messages"> }) {
		const message = await ctx.db.get(messageId)
		if (!message) throw new Error("Message not found")

		return message.authorId === this.user._id
	}
	public async validateOwnsMessage({ ctx, messageId }: { ctx: GenericContext; messageId: Id<"messages"> }) {
		if (!(await this.ownsMessage({ ctx, messageId }))) {
			throw new Error("You do not have permission to update this message")
		}
	}

	public async canAccessPinnedMessage(args: { ctx: GenericContext; pinnedMessageId: Id<"pinnedMessages"> }) {
		const pinnedMessage = await args.ctx.db.get(args.pinnedMessageId)
		if (!pinnedMessage) throw new Error("Pinned message not found")

		return await this.canViewChannel({ ctx: args.ctx, channelId: pinnedMessage.channelId })
	}
	public async validateCanAccessPinnedMessage(args: { ctx: GenericContext; pinnedMessageId: Id<"pinnedMessages"> }) {
		if (!(await this.canAccessPinnedMessage(args))) {
			throw new Error("You do not have permission to delete this pinned message")
		}
	}

	public async ownsReaction({ ctx, reactionId }: { ctx: GenericContext; reactionId: Id<"reactions"> }) {
		const reaction = await ctx.db.get(reactionId)
		if (!reaction) throw new Error("Reaction not found")

		return reaction.userId === this.user._id
	}
	public async validateOwnsReaction({ ctx, reactionId }: { ctx: GenericContext; reactionId: Id<"reactions"> }) {
		if (!(await this.ownsReaction({ ctx, reactionId }))) {
			throw new Error("You do not have permission to delete this reaction")
		}
	}
}
