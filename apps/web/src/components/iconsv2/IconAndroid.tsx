// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconAndroid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.5 4.134a1 1 0 0 1 1.366.366l1.267 2.194A10.95 10.95 0 0 1 12 5c2.156 0 4.169.621 5.867 1.694L19.134 4.5a1 1 0 1 1 1.732 1l-1.399 2.423A10.97 10.97 0 0 1 23 16v1.982c0 .562-.456 1.018-1.018 1.018H2.018A1.02 1.02 0 0 1 1 17.982V16c0-3.193 1.362-6.069 3.533-8.077L3.134 5.5A1 1 0 0 1 3.5 4.134ZM8 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAndroid
