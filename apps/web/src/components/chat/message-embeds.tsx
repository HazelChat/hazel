import type { MessageId } from "@hazel/schema"
import type { Message } from "@hazel/domain/models"
import { Embed } from "~/components/embeds"
import { MessageLive } from "./message-live-state"

// Extract embed type from the Message model
type MessageEmbedType = NonNullable<typeof Message.Model.Type.embeds>[number]

interface MessageEmbedsProps {
	embeds: typeof Message.Model.Type.embeds
	messageId?: MessageId
}

export function MessageEmbeds({ embeds, messageId }: MessageEmbedsProps) {
	if (!embeds?.length) return null

	// Find the embed with live state enabled and extract cached state and loading config
	const liveStateEmbed = embeds.find((embed) => embed.liveState?.enabled === true)
	const hasLiveState = !!liveStateEmbed
	const cachedState = liveStateEmbed?.liveState?.cached
	const loadingConfig = liveStateEmbed?.liveState?.loading

	// Filter out embeds that only have liveState (no visible content)
	const visibleEmbeds = embeds.filter((embed) => hasVisibleContent(embed))

	return (
		<div className="mt-2 flex flex-col gap-2">
			{visibleEmbeds.map((embed, index) => (
				<MessageEmbedCard key={index} embed={embed} />
			))}
			{/* Render live state UI if enabled and messageId is provided */}
			{hasLiveState && messageId && (
				<MessageLive.Provider
					messageId={messageId}
					enabled
					cached={cachedState}
					loading={loadingConfig}
				>
					<MessageLive.Root>
						<MessageLive.Progress />
						<MessageLive.Steps />
						<MessageLive.Text />
						<MessageLive.Error />
					</MessageLive.Root>
				</MessageLive.Provider>
			)}
		</div>
	)
}

/** Check if an embed has any visible content (not just liveState) */
function hasVisibleContent(embed: MessageEmbedType): boolean {
	return !!(
		embed.title ||
		embed.description ||
		embed.author ||
		embed.footer ||
		embed.image ||
		embed.thumbnail ||
		(embed.fields && embed.fields.length > 0)
	)
}

function MessageEmbedCard({ embed }: { embed: MessageEmbedType }) {
	// Convert integer color to hex string
	const accentColor = embed.color ? `#${embed.color.toString(16).padStart(6, "0")}` : undefined

	return (
		<Embed accentColor={accentColor} url={embed.url}>
			{/* Author row with optional badge */}
			{embed.author && (
				<Embed.Author
					iconUrl={embed.author.iconUrl}
					name={embed.author.name}
					url={embed.author.url}
					badge={embed.badge}
				/>
			)}

			{/* Body with thumbnail */}
			{(embed.title || embed.description) && (
				<div className="relative">
					<Embed.Body
						title={embed.title || ""}
						titleUrl={embed.url}
						description={embed.description}
						className={embed.thumbnail ? "pr-20" : undefined}
					/>
					{embed.thumbnail && <Embed.Thumbnail src={embed.thumbnail.url} />}
				</div>
			)}

			{/* Fields grid */}
			{embed.fields && embed.fields.length > 0 && (
				<Embed.Fields
					fields={embed.fields.map((f) => ({
						name: f.name,
						value: f.value,
						inline: f.inline,
						type: f.type,
						options: f.options,
					}))}
				/>
			)}

			{/* Full-width image */}
			{embed.image && <Embed.Image src={embed.image.url} />}

			{/* Footer with timestamp */}
			{(embed.footer || embed.timestamp) && (
				<Embed.Footer
					iconUrl={embed.footer?.iconUrl}
					text={embed.footer?.text}
					timestamp={embed.timestamp ? new Date(embed.timestamp) : undefined}
				/>
			)}
		</Embed>
	)
}
