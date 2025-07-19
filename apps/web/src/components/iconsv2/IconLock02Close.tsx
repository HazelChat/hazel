// solid/security
import type { Component, JSX } from "solid-js"

export const IconLock02Close: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.5 2A5.5 5.5 0 0 0 6 7.5v2.036a4 4 0 0 0-1.564 1.648c-.247.485-.346 1.002-.392 1.564C4 13.29 4 13.954 4 14.758v1.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C8.29 22 8.954 22 9.758 22h3.483c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01v-1.483c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565A4 4 0 0 0 17 9.536V7.5A5.5 5.5 0 0 0 11.5 2ZM9.634 9C9.024 9 8.482 9 8 9.027V7.5a3.5 3.5 0 0 1 7 0v1.527A30 30 0 0 0 13.366 9z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLock02Close
