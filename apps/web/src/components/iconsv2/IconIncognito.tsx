// solid/media
import type { Component, JSX } from "solid-js"

export const IconIncognito: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				d="m17.854 4.35 2.388 4.48q1.014.206 2.008.462a1 1 0 1 1-.499 1.937 39 39 0 0 0-2.356-.529 39.4 39.4 0 0 0-14.79 0q-1.19.229-2.356.529a1 1 0 1 1-.498-1.937q.995-.255 2.007-.463l2.389-4.478a4 4 0 0 1 4.025-2.087c1.317.165 2.34.165 3.656 0a4 4 0 0 1 4.026 2.087Z"
				fill="currentColor"
			/>
			<path
				d="M6 12a5 5 0 1 0 4.9 6h2.2a5.002 5.002 0 0 0 9.9-1 5 5 0 0 0-9.9-1h-2.2A5 5 0 0 0 6 12Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconIncognito
