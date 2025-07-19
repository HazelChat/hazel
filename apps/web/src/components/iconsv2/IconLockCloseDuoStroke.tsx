// duo-stroke/security
import type { Component, JSX } from "solid-js"

export const IconLockCloseDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.303 9H9.697c-1.662 0-2.584 0-3.27.239q-.125.043-.242.098c-.951.45-1.684 1.307-2.021 2.366-.253.793-.175 1.794-.02 3.795.133 1.723.2 2.584.507 3.26.41.901 1.119 1.604 1.987 1.969.65.273 1.454.273 3.06.273h4.605c1.605 0 2.408 0 3.06-.273.867-.365 1.577-1.068 1.986-1.969.308-.676.374-1.537.508-3.26.155-2.001.232-3.002-.02-3.795-.338-1.059-1.071-1.916-2.022-2.366a3 3 0 0 0-.242-.098C16.887 9 15.965 9 14.303 9Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M10.071 14c0-1.034.795-2 1.929-2s1.929.966 1.929 2a2.04 2.04 0 0 1-.93 1.714V17a1 1 0 1 1-2 0v-1.286A2.04 2.04 0 0 1 10.072 14Z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M5.438 8.6q.155-.09.32-.167.167-.079.34-.139c.435-.151.902-.22 1.412-.255C7.924 5.692 9.83 4 12 4s4.075 1.692 4.49 4.04c.51.034.977.103 1.412.254q.174.06.34.139.165.077.32.167C18.37 4.982 15.568 2 12 2S5.63 4.982 5.438 8.6Z"
			/>
			<path fill="currentColor" d="m17.225 10.176.02.007.019.007z" />
			<path fill="currentColor" d="m6.77 10.178-.03.01.016-.005z" />
		</svg>
	)
}

export default IconLockCloseDuoStroke
