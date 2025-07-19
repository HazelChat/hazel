// solid/devices
import type { Component, JSX } from "solid-js"

export const IconMouseScroll: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 10a8 8 0 1 1 16 0v4a8 8 0 1 1-16 0zm8-3.374c-.328 0-.656.11-.925.328A11 11 0 0 0 9.2 8.9a1 1 0 0 0 1.6 1.2A9 9 0 0 1 12 8.792q.665.594 1.2 1.308a1 1 0 0 0 1.6-1.2 11 11 0 0 0-1.875-1.946A1.47 1.47 0 0 0 12 6.626ZM10.8 13.9a1 1 0 1 0-1.6 1.2 11 11 0 0 0 1.875 1.946 1.47 1.47 0 0 0 1.85 0A11 11 0 0 0 14.8 15.1a1 1 0 1 0-1.6-1.2 9 9 0 0 1-1.2 1.308 9 9 0 0 1-1.2-1.308Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMouseScroll
