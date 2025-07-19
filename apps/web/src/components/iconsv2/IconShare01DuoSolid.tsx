// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconShare01DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.41 17.49c-2.583-.773-4.925-2.033-6.82-3.98m6.82-7c-2.583.773-4.924 2.032-6.82 3.98"
				opacity=".28"
			/>
			<path fill="currentColor" d="M18 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
			<path fill="currentColor" d="M6 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
			<path fill="currentColor" d="M18 15a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
		</svg>
	)
}

export default IconShare01DuoSolid
