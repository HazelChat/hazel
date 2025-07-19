// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconSwapHalfarrowVerticalDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14 17.344V6m-4 .656V18"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M5.124 7.37a1 1 0 0 1 .072-1.078A21.2 21.2 0 0 1 8.979 2.36C9.276 2.121 9.638 2 10 2a1 1 0 0 1 1 1v4.656h-1q-.852 0-1.703.063l-2.223.165a1 1 0 0 1-.95-.514Z"
			/>
			<path
				fill="currentColor"
				d="M18.876 16.63a1 1 0 0 1-.072 1.078 21.2 21.2 0 0 1-3.783 3.933c-.297.238-.659.36-1.021.36a1 1 0 0 1-1-1v-4.657h1q.852 0 1.703-.063l2.223-.165a1 1 0 0 1 .95.514Z"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowVerticalDuoSolid
