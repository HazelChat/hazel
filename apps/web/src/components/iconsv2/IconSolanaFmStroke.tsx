// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconSolanaFmStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.515 12.5A7 7 0 0 1 9 18.58m9.988-6.08C18.728 17.79 14.355 22 9 22m-.515-10.5a7 7 0 0 1 6.942-6.094M5.012 11.5C5.272 6.21 9.645 2 15 2M9 15a3 3 0 0 0 3-3 3 3 0 0 1 3-3"
				fill="none"
			/>
		</svg>
	)
}

export default IconSolanaFmStroke
