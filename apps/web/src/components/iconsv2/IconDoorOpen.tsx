// solid/building
import type { Component, JSX } from "solid-js"

export const IconDoorOpen: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 20h9m8 0h3"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 20V7.98c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.092C6.9 3.98 7.6 3.98 9 3.98h2"
				fill="none"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M11.705.466a2.2 2.2 0 0 1 .868.082c.272.075.595.197.94.326l3.243 1.217.611.23c.579.225 1.06.444 1.447.785l.156.146c.35.35.625.77.802 1.235l.08.245c.16.582.148 1.238.148 2.04v14.011l-6.51 2.373c-.343.125-.664.244-.934.316a2.2 2.2 0 0 1-.865.074l-.14-.026a2 2 0 0 1-1.115-.703l-.113-.157c-.212-.326-.273-.677-.299-.96-.025-.278-.024-.62-.024-.986V3.309c0-.369 0-.714.024-.995.026-.284.088-.637.302-.965l.114-.158a2 2 0 0 1 1.124-.7zm1.324 10.152a1 1 0 1 0 0 2h.918a1 1 0 0 0 0-2z"
				clip-rule="evenodd"
				stroke="currentColor"
			/>
		</svg>
	)
}

export default IconDoorOpen
