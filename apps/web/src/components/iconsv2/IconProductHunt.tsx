// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconProductHunt: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M12.813 12.625H11V9h1.813a1.813 1.813 0 0 1 0 3.625Z" fill="currentColor" />
			<path
				fill-rule="evenodd"
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12ZM10 7a1 1 0 0 0-1 1v9a1 1 0 1 0 2 0v-2.375h1.813a3.812 3.812 0 1 0 0-7.625z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconProductHunt
