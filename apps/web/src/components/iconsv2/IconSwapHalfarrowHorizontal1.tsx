// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconSwapHalfarrowHorizontal1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M17.113 6a20.2 20.2 0 0 1 3.747 3.604c.093.116.14.256.14.396h-3.656q0-.89-.066-1.777z"
				/>
				<path
					fill="currentColor"
					d="M6.887 18a20.2 20.2 0 0 1-3.747-3.604A.63.63 0 0 1 3 14h3.656q0 .89.066 1.777z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.344 10H21c0-.14-.047-.28-.14-.396A20.2 20.2 0 0 0 17.113 6l.165 2.223q.066.888.066 1.777Zm0 0H6m.656 4H3c0 .14.047.28.14.396A20.2 20.2 0 0 0 6.887 18l-.165-2.223A24 24 0 0 1 6.656 14Zm0 0H18"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowHorizontal1
