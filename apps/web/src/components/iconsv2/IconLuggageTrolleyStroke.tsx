// stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconLuggageTrolleyStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 19H8M3 3a2 2 0 0 1 2 2v11m0 0a3 3 0 1 0 3 3m-3-3a3 3 0 0 1 3 3m7-10V5.5m0 0h-2.8c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C9 7.02 9 7.58 9 8.7v3.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218h5.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 13.98 21 13.42 21 12.3V8.7c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 5.5 18.92 5.5 17.8 5.5z"
				fill="none"
			/>
		</svg>
	)
}

export default IconLuggageTrolleyStroke
