// duo-solid/editing
import type { Component, JSX } from "solid-js"

export const IconTextQuotesOpenDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14 13.999A9.4 9.4 0 0 1 18 6.3M4 14a9.4 9.4 0 0 1 4-7.7"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M17 17.999a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-10 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconTextQuotesOpenDuoSolid
