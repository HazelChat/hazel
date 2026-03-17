import type { User } from "@hazel/domain/models"
import type { UserId } from "@hazel/schema"
import { useBotName } from "~/db/hooks"
import { getInitials } from "../ui/avatar/utils"

export interface ChatAuthorUserLike {
	avatarUrl?: string | null
	firstName: string
	lastName: string
	userType?: string | null
}

export interface ChatAuthorIdentity {
	displayName: string
	initials: string
	seed?: string
	avatarUrl?: string | null
	isBot: boolean
}

export function buildChatAuthorIdentity(
	user: ChatAuthorUserLike | User.Type | null | undefined,
	botName?: string | null,
): ChatAuthorIdentity {
	if (!user) {
		return {
			displayName: "",
			initials: "",
			isBot: false,
		}
	}

	const isBot = user.userType === "machine"
	const fallbackName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
	const displayName = isBot && botName ? botName : fallbackName

	return {
		displayName,
		initials: displayName ? getInitials(displayName) : "",
		seed: displayName || undefined,
		avatarUrl: user.avatarUrl,
		isBot,
	}
}

export function useChatAuthorIdentity(
	userId: UserId | undefined,
	user: ChatAuthorUserLike | User.Type | null | undefined,
): ChatAuthorIdentity {
	const botName = useBotName(userId, user?.userType)
	return buildChatAuthorIdentity(user, botName)
}
