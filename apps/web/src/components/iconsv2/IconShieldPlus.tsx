// solid/security
import type { Component, JSX } from "solid-js"

export const IconShieldPlus: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.543 1.427a4 4 0 0 1 2.717 0l5.466 1.974a4 4 0 0 1 2.63 3.455l.226 2.951a12 12 0 0 1-6.25 11.472l-1.488.806a4 4 0 0 1-3.886-.042l-1.52-.867A12 12 0 0 1 2.39 10.29l.127-3.309a4 4 0 0 1 2.638-3.608zM13 8.9a1 1 0 1 0-2 0V11H8.9a1 1 0 1 0 0 2H11v2.1a1 1 0 1 0 2 0V13h2.1a1 1 0 1 0 0-2H13z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconShieldPlus
