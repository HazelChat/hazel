// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconSlack: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M8.5 1a2.5 2.5 0 0 0 0 5H9a2 2 0 0 0 2-2v-.5A2.5 2.5 0 0 0 8.5 1Z" fill="currentColor" />
			<path
				d="M14.5 1A2.5 2.5 0 0 0 12 3.5v5a2.5 2.5 0 0 0 5 0v-5A2.5 2.5 0 0 0 14.5 1Z"
				fill="currentColor"
			/>
			<path
				d="M20.5 6A2.5 2.5 0 0 0 18 8.5V9a2 2 0 0 0 2 2h.5a2.5 2.5 0 0 0 0-5Z"
				fill="currentColor"
			/>
			<path d="M3.5 7a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 0 0-5z" fill="currentColor" />
			<path d="M15.5 12a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 0 0-5z" fill="currentColor" />
			<path d="M3.5 13A2.5 2.5 0 1 0 6 15.5V15a2 2 0 0 0-2-2z" fill="currentColor" />
			<path
				d="M9.5 13A2.5 2.5 0 0 0 7 15.5v5a2.5 2.5 0 0 0 5 0v-5A2.5 2.5 0 0 0 9.5 13Z"
				fill="currentColor"
			/>
			<path d="M15 18a2 2 0 0 0-2 2v.5a2.5 2.5 0 1 0 2.5-2.5z" fill="currentColor" />
		</svg>
	)
}

export default IconSlack
