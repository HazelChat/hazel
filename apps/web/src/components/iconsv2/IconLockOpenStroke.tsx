// stroke/security
import type { Component, JSX } from "solid-js"

export const IconLockOpenStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 17v-2m0 0c.513 0 .929-.448.929-1s-.416-1-.929-1-.929.448-.929 1 .416 1 .929 1ZM6.427 9.239V9c0-3.314 2.495-6 5.573-6 .651 0 1.277.12 1.858.341M6.427 9.24C7.113 9 8.035 9 9.697 9h4.606c1.662 0 2.584 0 3.27.239q.126.043.242.098c.951.45 1.684 1.307 2.021 2.366.253.793.176 1.794.02 3.795-.133 1.723-.2 2.584-.507 3.26-.41.901-1.119 1.604-1.987 1.969-.65.273-1.454.273-3.06.273H9.698c-1.605 0-2.408 0-3.06-.273-.867-.365-1.577-1.068-1.986-1.969-.308-.676-.374-1.537-.508-3.26-.154-2.001-.232-3.002.02-3.795.338-1.059 1.071-1.916 2.022-2.366q.117-.056.242-.098Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconLockOpenStroke
