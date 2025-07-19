// contrast/navigation
import type { Component, JSX } from "solid-js"

export const IconNavigationHorizontal1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="m10.44 17.732-5.083 3.176a.592.592 0 0 1-.89-.632l.127-.559a51.2 51.2 0 0 1 6.939-16.463.556.556 0 0 1 .934 0 51.2 51.2 0 0 1 6.939 16.463l.127.559a.591.591 0 0 1-.89.632l-5.084-3.177a2.94 2.94 0 0 0-3.12 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m10.44 17.732-5.083 3.176a.592.592 0 0 1-.89-.632l.127-.559a51.2 51.2 0 0 1 6.939-16.463.556.556 0 0 1 .934 0 51.2 51.2 0 0 1 6.939 16.463l.127.559a.591.591 0 0 1-.89.632l-5.084-3.177a2.94 2.94 0 0 0-3.12 0Z"
			/>
		</svg>
	)
}

export default IconNavigationHorizontal1
