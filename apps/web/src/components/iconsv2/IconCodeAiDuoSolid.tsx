// duo-solid/ai
import type { Component, JSX } from "solid-js"

export const IconCodeAiDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.466 4.188c-1.657 0-3 1.194-3 2.667V9.52c0 1.473-1.343 2.667-3 2.667 1.657 0 3 1.194 3 2.667v2.666c0 1.473 1.343 2.667 3 2.667m8-16c1.657 0 3 1.194 3 2.667V9.52c0 1.473 1.343 2.667 3 2.667-1.657 0-3 1.194-3 2.667v2.666c0 1.473-1.343 2.667-3 2.667"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M13.897 8.633a1 1 0 0 0-1.861 0c-.293.743-.566 1.19-.896 1.523-.329.332-.78.614-1.54.914a1 1 0 0 0 0 1.86c.76.3 1.211.582 1.54.914.33.332.603.78.896 1.523a1.001 1.001 0 0 0 1.86 0c.293-.743.566-1.19.896-1.523s.781-.614 1.541-.914a1 1 0 0 0 0-1.86c-.76-.3-1.211-.582-1.54-.914-.33-.332-.603-.78-.896-1.523ZM8.967 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconCodeAiDuoSolid
