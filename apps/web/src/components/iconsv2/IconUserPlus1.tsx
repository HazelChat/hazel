// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserPlus1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
				<path
					fill="currentColor"
					d="M7 15a4 4 0 0 0-4 4 2 2 0 0 0 2 2h11.352a1 1 0 0 0-.353-.762h.003A3 3 0 0 1 15 18a3 3 0 0 1-3-3z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.352 21H5a2 2 0 0 1-2-2 4 4 0 0 1 4-4h4m7 3v-3m0 0v-3m0 3h-3m3 0h3m-6-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserPlus1
