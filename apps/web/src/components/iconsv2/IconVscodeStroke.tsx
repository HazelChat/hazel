// stroke/development
import type { Component, JSX } from "solid-js"

export const IconVscodeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m17 21 3.231-1.616c.642-.32.963-.481 1.198-.72a2 2 0 0 0 .462-.748C22 17.6 22 17.24 22 16.522V7.478c0-.718 0-1.077-.11-1.394a2 2 0 0 0-.461-.747c-.235-.24-.556-.4-1.198-.721L17 3m0 18v-5m0 5-7.789-7.01M17 3v4.997M17 3l-7.788 7.01M17 7.996V16m0-8.003-5.201 4.002M17 16l-5.201-4m0 0-2.587-1.99m0 0L4 6 2 7.5 7 12m0 0-5 4.5L4 18l5.211-4.01M7 12l2.211 1.99"
				fill="none"
			/>
		</svg>
	)
}

export default IconVscodeStroke
