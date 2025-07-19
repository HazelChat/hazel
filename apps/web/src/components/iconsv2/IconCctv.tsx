// solid/appliances
import type { Component, JSX } from "solid-js"

export const IconCctv: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.031 2.552a3 3 0 0 0-3.674 2.121l-.805 3.005a3 3 0 0 0 2.121 3.674l3.885 1.041-1.305 3.718L3 16.82V15a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-2.153l4.581-.763a2 2 0 0 0 1.559-1.31l1.355-3.862 5.083 1.362a2 2 0 0 0 2.45-1.414l1.322-4.937a2 2 0 0 0-1.414-2.45z"
				fill="currentColor"
			/>
			<path
				d="M22.21 8.971a1 1 0 0 0-1.932-.518l-1.294 4.83a1 1 0 0 0 1.932.518z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCctv
