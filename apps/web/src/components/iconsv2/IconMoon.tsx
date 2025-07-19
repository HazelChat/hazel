// solid/weather
import type { Component, JSX } from "solid-js"

export const IconMoon: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10v-.038a1 1 0 0 0-1.846-.53 5.5 5.5 0 1 1-7.586-7.586A1 1 0 0 0 12.038 2z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMoon
