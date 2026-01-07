import IconHashtag from "~/components/icons/icon-hashtag"

interface ChannelIconProps {
	icon?: string | null
	className?: string
}

export function ChannelIcon({ icon, className }: ChannelIconProps) {
	if (icon) {
		return <span data-slot="icon" className={className}>{icon}</span>
	}

	return <IconHashtag className={className} />
}
