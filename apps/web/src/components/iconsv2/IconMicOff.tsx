// solid/media
import type { Component, JSX } from "solid-js"

export const IconMicOff: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.707 1.293a1 1 0 0 0-1.414 0L16.84 5.745A5.002 5.002 0 0 0 7 7v5a5 5 0 0 0 .829 2.757l-1.435 1.435A6.97 6.97 0 0 1 5 12a1 1 0 1 0-2 0c0 2.125.737 4.078 1.968 5.618l-3.675 3.675a1 1 0 1 0 1.414 1.414l20-20a1 1 0 0 0 0-1.414Z"
				fill="currentColor"
			/>
			<path
				d="M21 12a1 1 0 1 0-2 0 7 7 0 0 1-8.83 6.759 1 1 0 0 0-.522 1.93q.659.179 1.352.256V22a1 1 0 1 0 2 0v-1.055A9 9 0 0 0 21 12Z"
				fill="currentColor"
			/>
			<path
				d="M16.636 13.875a1 1 0 0 0-1.854-.75 3 3 0 0 1-1.657 1.657 1 1 0 1 0 .75 1.854 5 5 0 0 0 2.761-2.76Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMicOff
