// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconCrownWinnerKingDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19.23 21.5a20.6 20.6 0 0 0-14.46 0"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M1.573 6.94c-.142-.616.611-1.034 1.058-.587 2.555 2.556 6.89 1.666 8.233-1.69l.765-1.912a.4.4 0 0 1 .742 0l.765 1.912c1.342 3.356 5.677 4.246 8.232 1.69.447-.447 1.2-.03 1.058.587l-2.484 10.767a22.62 22.62 0 0 0-15.884 0z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCrownWinnerKingDuoStroke
