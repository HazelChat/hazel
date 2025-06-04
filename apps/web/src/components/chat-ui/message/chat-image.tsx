import { twMerge } from "tailwind-merge"

export function ChatImage(props: { src: string; alt: string; onClick: () => void; class?: string }) {
	return (
		<img
			src={props.src}
			onclick={props.onClick}
			class={twMerge(props.class)}
			alt={props.alt}
			loading="lazy"
		/>
	)
}
