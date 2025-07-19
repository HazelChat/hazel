// duo-solid/automotive
import type { Component, JSX } from "solid-js"

export const IconAirplaneTouchdownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M8.675 1.034a1 1 0 0 0-1.254 1.063l.688 7.068-1.212-.325-1.98-2.253a2 2 0 0 0-.985-.612l-.673-.18A1 1 0 0 0 2.002 6.82l.25 4.155a4 4 0 0 0 2.957 3.624l13.366 3.581a2 2 0 0 0 2.45-1.414 4 4 0 0 0-2.829-4.898l-2.46-.66-3.89-7.91a4 4 0 0 0-2.554-2.099z"
				clip-rule="evenodd"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 20h18"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconAirplaneTouchdownDuoSolid
