// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconShuffle: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.792 3.2a1 1 0 0 0-1.596.898l.064.645q.061.628.09 1.257h-.226a7 7 0 0 0-5.735 2.986l-3.417 4.881A5 5 0 0 1 3.876 16H2a1 1 0 1 0 0 2h1.876a7 7 0 0 0 5.735-2.986l3.417-4.881A5 5 0 0 1 17.124 8h.225q-.027.63-.089 1.257l-.064.645a1 1 0 0 0 1.596.898 16 16 0 0 0 2.83-2.727 1.7 1.7 0 0 0 0-2.146 16 16 0 0 0-2.83-2.727Z"
				fill="currentColor"
			/>
			<path
				d="M2 6a1 1 0 0 0 0 2h1.876a5 5 0 0 1 3.307 1.25 1 1 0 0 0 1.323-1.5A7 7 0 0 0 3.876 6z"
				fill="currentColor"
			/>
			<path
				d="M18.792 13.2a1 1 0 0 0-1.596.898l.064.645q.061.628.09 1.257h-.226a5 5 0 0 1-3.173-1.136 1 1 0 0 0-1.27 1.546A7 7 0 0 0 17.125 18h.225q-.027.63-.089 1.257l-.064.645a1 1 0 0 0 1.596.898 16 16 0 0 0 2.83-2.727 1.7 1.7 0 0 0 0-2.146 16 16 0 0 0-2.83-2.727Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconShuffle
