// solid/sports
import type { Component, JSX } from "solid-js"

export const IconPlayground: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M5 4h14a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4ZM3 8a2 2 0 0 1 2-2h6v2.126a4.002 4.002 0 0 0 0 7.748V18H5a2 2 0 0 1-2-2h1a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3zm10 .126V6h6a2 2 0 0 1 2 2h-1a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a2 2 0 0 1-2 2h-6v-2.126a4.002 4.002 0 0 0 0-7.748Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPlayground
