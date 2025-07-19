// stroke/ai
import type { Component, JSX } from "solid-js"

export const IconAppleNewSiriStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<circle cx="12" cy="12" r="9.15" stroke="currentColor" stroke-width="2" fill="none" />
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-width="2"
				d="M11.402 15c-1.22.94-2.64 1.758-3.888 1.758a4.514 4.514 0 0 1 0-9.028c2.931 0 6.814 4.514 6.814 4.514s2.338 2.719 4.103 2.719a2.718 2.718 0 0 0 0-5.437c-.311 0-.64.085-.971.224"
				fill="none"
			/>
		</svg>
	)
}

export default IconAppleNewSiriStroke
