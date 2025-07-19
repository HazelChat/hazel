// solid/development
import type { Component, JSX } from "solid-js"

export const IconServerSettings: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.4 3A3.4 3.4 0 0 0 2 6.4v1.2A3.4 3.4 0 0 0 5.4 11h13.2A3.4 3.4 0 0 0 22 7.6V6.4A3.4 3.4 0 0 0 18.6 3zM13 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M13.102 13a3 3 0 0 0-.93 2.14l-.005.444-.31.317a3 3 0 0 0 0 4.198l.31.317.005.444q0 .07.004.14H5.4A3.4 3.4 0 0 1 2 17.6v-1.2A3.4 3.4 0 0 1 5.4 13z"
				fill="currentColor"
			/>
			<path d="M18 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z" fill="currentColor" />
			<path
				fill-rule="evenodd"
				d="M17.3 13.286a1 1 0 0 1 1.4 0l.891.873 1.248.013a1 1 0 0 1 .99.99l.012 1.247.873.891a1 1 0 0 1 0 1.4l-.873.891-.013 1.248a1 1 0 0 1-.99.99l-1.247.012-.891.873a1 1 0 0 1-1.4 0l-.891-.873-1.248-.013a1 1 0 0 1-.99-.99l-.012-1.247-.873-.891a1 1 0 0 1 0-1.4l.873-.891.013-1.248a1 1 0 0 1 .99-.99l1.247-.012zM18 15.4l-.479.469a1 1 0 0 1-.69.285l-.67.007-.007.67a1 1 0 0 1-.285.69l-.47.479.47.479a1 1 0 0 1 .285.69l.007.67.67.007a1 1 0 0 1 .69.285l.479.47.479-.47a1 1 0 0 1 .69-.285l.67-.007.007-.67a1 1 0 0 1 .285-.69l.47-.479-.47-.479a1 1 0 0 1-.285-.69l-.007-.67-.67-.007a1 1 0 0 1-.69-.285z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconServerSettings
