// contrast/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconTinder1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M8.827 9.663c3.627-1.25 4.244-4.507 3.781-7.502 0-.108.093-.185.186-.154 3.473 1.698 7.378 5.402 7.378 10.959 0 4.26-3.304 8.026-8.104 8.026A7.717 7.717 0 0 1 7.715 6.684c.093-.062.217 0 .217.108.046.57.2 2.006.833 2.87z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill-rule="evenodd"
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.827 9.663c3.627-1.25 4.244-4.507 3.781-7.502 0-.108.093-.185.186-.154 3.473 1.698 7.378 5.402 7.378 10.959 0 4.26-3.304 8.026-8.104 8.026A7.717 7.717 0 0 1 7.715 6.684c.093-.062.217 0 .217.108.046.57.2 2.006.833 2.87z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconTinder1
