// solid/security
import type { Component, JSX } from "solid-js"

export const IconBanRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85c2.442 0 4.684.864 6.435 2.3L4.15 18.437A10.1 10.1 0 0 1 1.85 12Z"
				fill="currentColor"
			/>
			<path
				d="M5.564 19.85A10.1 10.1 0 0 0 12 22.15c5.605 0 10.15-4.544 10.15-10.15 0-2.442-.864-4.684-2.3-6.435z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBanRight
