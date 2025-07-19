// solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyBottomLeft02: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.508 9.25a5.5 5.5 0 1 1 4.243 4.243l-2.044 2.042a1 1 0 0 1-.707.293h-1.121v1.122a1 1 0 0 1-.293.707l-2.122 2.121a1 1 0 0 1-.707.293H4.93a1 1 0 0 1-1-1v-2.828a1 1 0 0 1 .293-.707zm5.227-3.643a1.1 1.1 0 0 0-.623 1.867l1.414 1.414a1.1 1.1 0 0 0 1.867-.623 2.352 2.352 0 0 0-2.658-2.658Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconKeyBottomLeft02
