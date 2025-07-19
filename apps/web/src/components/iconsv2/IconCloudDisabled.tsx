// solid/development
import type { Component, JSX } from "solid-js"

export const IconCloudDisabled: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.293 3.293a1 1 0 1 1 1.414 1.414l-18 18a1 1 0 0 1-1.414-1.414l1.622-1.622A5.49 5.49 0 0 1 1 15.5a5.5 5.5 0 0 1 2.609-4.68c.475-.294.824-.51 1.068-.664q.181-.116.271-.177c.128-.087.165-.229.223-.367.087-.208.204-.501.367-.906a7.502 7.502 0 0 1 11.511-3.17z"
				fill="currentColor"
			/>
			<path
				d="M18.979 9.31a1 1 0 0 1 1.287-.108A6.5 6.5 0 0 1 16.5 21H9.702a1 1 0 0 1-.707-1.707z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCloudDisabled
