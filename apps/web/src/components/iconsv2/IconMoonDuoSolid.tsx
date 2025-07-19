// duo-solid/weather
import type { Component, JSX } from "solid-js"

export const IconMoonDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10v-.038a1 1 0 0 0-1.846-.53 5.5 5.5 0 1 1-7.586-7.586A1 1 0 0 0 12.038 2z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M13.477 2.464a1 1 0 0 1-.27 1.388 5 5 0 1 0 6.94 6.94 1 1 0 0 1 1.659 1.12 7 7 0 1 1-9.717-9.718 1 1 0 0 1 1.388.27Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconMoonDuoSolid
