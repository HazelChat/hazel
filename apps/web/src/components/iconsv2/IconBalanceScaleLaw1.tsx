// contrast/general
import type { Component, JSX } from "solid-js"

export const IconBalanceScaleLaw1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M1.804 12a1 1 0 0 0-1 .999 4.195 4.195 0 1 0 8.392 0 1 1 0 0 0-1-.999z"
				/>
				<path
					fill="currentColor"
					d="M15.804 12a1 1 0 0 0-1 .999 4.195 4.195 0 1 0 8.392 0 1 1 0 0 0-1-.999z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 2v1.75M16 21h-4m-4 0h4m9-16a4.82 4.82 0 0 1-4.055.12l-1.583-.68A8.5 8.5 0 0 0 12 3.75M3 5a4.82 4.82 0 0 0 4.055.12l1.583-.68A8.5 8.5 0 0 1 12 3.75M12 21V3.75m7 1.75-2.891 6.145a3.196 3.196 0 1 0 5.783 0zm-14 0-2.89 6.145a3.196 3.196 0 1 0 5.783 0z"
			/>
		</svg>
	)
}

export default IconBalanceScaleLaw1
