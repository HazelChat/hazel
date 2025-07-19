// solid/security
import type { Component, JSX } from "solid-js"

export const IconShieldOff: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414L19.05 3.535a4 4 0 0 0-.325-.134L13.26 1.427a4 4 0 0 0-2.717 0L5.156 3.373A4 4 0 0 0 2.518 6.98l-.128 3.31a12 12 0 0 0 2.329 7.577l-3.426 3.426a1 1 0 1 0 1.414 1.414z"
				fill="currentColor"
			/>
			<path
				d="M21.525 9.06a1 1 0 0 0-1.704-.631L8.496 19.754a1 1 0 0 0 .212 1.576l1.25.713a4 4 0 0 0 3.887.042l1.488-.806a12 12 0 0 0 6.25-11.472z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconShieldOff
