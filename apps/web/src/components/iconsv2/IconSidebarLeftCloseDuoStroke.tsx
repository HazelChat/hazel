// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconSidebarLeftCloseDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 20.989C9.577 21 10.236 21 11 21h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 3 15.8 3 13 3h-2c-.764 0-1.423 0-2 .011"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.5 9a15.3 15.3 0 0 0-2.92 2.777.354.354 0 0 0 0 .447 15.3 15.3 0 0 0 2.92 2.777M3 13v-2c0-2.8 0-4.2.545-5.27A5 5 0 0 1 5.73 3.546c.778-.397 1.73-.505 3.27-.534V20.99c-1.54-.03-2.492-.138-3.27-.534a5 5 0 0 1-2.185-2.185C3 17.2 3 15.8 3 13Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSidebarLeftCloseDuoStroke
