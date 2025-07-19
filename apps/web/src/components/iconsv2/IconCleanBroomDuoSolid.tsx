// duo-solid/editing
import type { Component, JSX } from "solid-js"

export const IconCleanBroomDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.722 12.465c-2.107 2.4-4.574 4.43-7.293 6.145-1.93 1.216 3.249 1.903 3.71 1.972M19 14.61c.028 1.769-.382 3.482-1.168 5.13-.657 1.379-3.696 1.264-5.336 1.254m-5.356-.412c1.773.263 3.563.401 5.356.412m-5.356-.412c1.14-.587 3.145-2.27 4.599-4.308m.757 4.72c.635-.687 1.976-2.296 2.72-3.7"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M19.574 3.38a1 1 0 1 0-1.849-.761l-2.709 6.574c-1.059-.157-1.93-.041-2.728.405-.782.437-1.421 1.174-2.059 1.909q-.129.15-.259.298a1 1 0 0 0 .5 1.628l8.278 2.144a1 1 0 0 0 1.25-.984 12 12 0 0 0-.215-2.066c-.217-1.134-.92-1.861-1.688-2.323a6 6 0 0 0-1.12-.514z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconCleanBroomDuoSolid
