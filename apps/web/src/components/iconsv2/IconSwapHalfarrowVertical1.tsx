// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconSwapHalfarrowVertical1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path
					fill="currentColor"
					d="M18 17.113a20.2 20.2 0 0 1-3.604 3.747A.63.63 0 0 1 14 21v-3.656q.89 0 1.777-.066z"
				/>
				<path
					fill="currentColor"
					d="M6 6.887A20.2 20.2 0 0 1 9.604 3.14.63.63 0 0 1 10 3v3.656q-.89 0-1.777.066z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 17.344V21c.14 0 .28-.047.396-.14A20.2 20.2 0 0 0 18 17.113l-2.223.165q-.888.066-1.777.066Zm0 0V6m-4 .656V3c-.14 0-.28.047-.396.14A20.2 20.2 0 0 0 6 6.887l2.223-.165A24 24 0 0 1 10 6.656Zm0 0V18"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowVertical1
