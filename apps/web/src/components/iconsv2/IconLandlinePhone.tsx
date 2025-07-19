// solid/devices
import type { Component, JSX } from "solid-js"

export const IconLandlinePhone: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.5 2A2.5 2.5 0 0 1 9 4.5v15A2.5 2.5 0 0 1 6.5 22h-2A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2z"
				fill="currentColor"
			/>
			<path
				fill-rule="evenodd"
				d="M19 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-8a1 1 0 0 1-1-1V4l.005-.103A1 1 0 0 1 11 3zm-6 13a1 1 0 1 0 0 2h1.5a1 1 0 1 0 0-2zm4.5 0a1 1 0 1 0 0 2H19a1 1 0 1 0 0-2zM13 13a1 1 0 1 0 0 2h1.5a1 1 0 1 0 0-2zm4.5 0a1 1 0 1 0 0 2H19a1 1 0 1 0 0-2zM13 5a1 1 0 0 0-.995.897L12 6v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6a1 1 0 0 0-.898-.995L19 5z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLandlinePhone
