// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMaximizeFourArrow1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M4.58 4.077a18.5 18.5 0 0 1 4.753.18l-1.229 1.04a24 24 0 0 0-2.807 2.807l-1.04 1.23a18.5 18.5 0 0 1-.18-4.754.555.555 0 0 1 .503-.503Z"
				/>
				<path
					fill="currentColor"
					d="M14.67 4.257a18.5 18.5 0 0 1 4.753-.18.555.555 0 0 1 .503.503 18.5 18.5 0 0 1-.18 4.753l-1.04-1.229a24 24 0 0 0-2.807-2.807z"
				/>
				<path
					fill="currentColor"
					d="M14.667 19.744c1.58.264 3.178.324 4.753.179a.555.555 0 0 0 .502-.503 18.5 18.5 0 0 0-.179-4.753l-1.04 1.229a24 24 0 0 1-2.807 2.807z"
				/>
				<path
					fill="currentColor"
					d="M9.33 19.744a18.5 18.5 0 0 1-4.753.179.555.555 0 0 1-.503-.503 18.5 18.5 0 0 1 .18-4.753l1.04 1.229A24 24 0 0 0 8.1 18.703z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.58 4.077a18.5 18.5 0 0 1 4.753.18l-1.229 1.04a24 24 0 0 0-2.807 2.807l-1.04 1.23a18.5 18.5 0 0 1-.18-4.754.555.555 0 0 1 .503-.503Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19.423 4.077a18.5 18.5 0 0 0-4.753.18l1.23 1.04a24 24 0 0 1 2.806 2.807l1.04 1.23c.266-1.582.326-3.18.18-4.754a.555.555 0 0 0-.503-.503Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19.42 19.923a18.5 18.5 0 0 1-4.753-.18l1.229-1.04a24 24 0 0 0 2.807-2.807l1.04-1.23c.265 1.582.325 3.18.18 4.754a.555.555 0 0 1-.503.503Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.577 19.923c1.575.145 3.172.085 4.753-.18l-1.229-1.04a24 24 0 0 1-2.807-2.807l-1.04-1.23a18.5 18.5 0 0 0-.18 4.754.555.555 0 0 0 .503.503Z"
			/>
		</svg>
	)
}

export default IconMaximizeFourArrow1
