// stroke/development
import type { Component, JSX } from "solid-js"

export const IconLinkBrokenSlantStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.911 7.422h-3M7.74 4.593v-3m8.4 17.057v3m2.828-5.829h3M5.447 10.957l-.707.707a5 5 0 0 0 7.07 7.071l.708-.707m-2.122-12.02.707-.708a5 5 0 0 1 7.072 7.071l-.707.707"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkBrokenSlantStroke
