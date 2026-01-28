import type { MessageEmbed } from "../common/embed-types.ts"
import type { RssFeedItem } from "./parser.ts"

// RSS orange color as integer
const RSS_COLOR = 0xf26522

/**
 * Build a message embed for an RSS feed item.
 */
export const buildRssEmbed = (
	item: RssFeedItem,
	feedTitle: string | null,
): MessageEmbed => {
	const embed: MessageEmbed = {
		title: item.title,
		url: item.link || undefined,
		color: RSS_COLOR,
		footer: {
			text: `RSS${feedTitle ? ` - ${feedTitle}` : ""}`,
		},
	}

	if (item.description) {
		embed.description = item.description
	}

	if (item.author) {
		embed.author = { name: item.author }
	}

	if (item.pubDate) {
		embed.timestamp = item.pubDate
	}

	return embed
}
