// contrast/media
import type { Component, JSX } from "solid-js"

export const IconPlaySmall1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7 11.808c0-2.643 0-3.964.552-4.702a2.77 2.77 0 0 1 2.02-1.102c.918-.065 2.03.649 4.253 2.078l.298.192c1.93 1.24 2.894 1.86 3.227 2.649a2.77 2.77 0 0 1 0 2.155c-.333.788-1.298 1.408-3.227 2.648l-.298.192c-2.223 1.429-3.335 2.143-4.254 2.078a2.77 2.77 0 0 1-2.019-1.102C7 16.156 7 14.834 7 12.192z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 11.808c0-2.643 0-3.964.552-4.702a2.77 2.77 0 0 1 2.02-1.102c.918-.065 2.03.649 4.253 2.078l.298.192c1.93 1.24 2.894 1.86 3.227 2.649a2.77 2.77 0 0 1 0 2.155c-.333.788-1.298 1.408-3.227 2.648l-.298.192c-2.223 1.429-3.335 2.143-4.254 2.078a2.77 2.77 0 0 1-2.019-1.102C7 16.156 7 14.834 7 12.192z"
			/>
		</svg>
	)
}

export default IconPlaySmall1
