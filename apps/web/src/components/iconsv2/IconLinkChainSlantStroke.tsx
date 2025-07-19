// stroke/development
import type { Component, JSX } from "solid-js"

export const IconLinkChainSlantStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.05 11.364a4.99 4.99 0 0 0-4.88-2.192 4.98 4.98 0 0 0-2.827 1.414L4.929 12a5 5 0 0 0 7.07 7.071l.708-.707m-2.758-5.728q.274.414.637.778a5 5 0 0 0 4.243 1.415 4.98 4.98 0 0 0 2.828-1.415L19.07 12A5 5 0 0 0 12 4.929l-.707.707"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkChainSlantStroke
