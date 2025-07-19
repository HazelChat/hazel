// duo-solid/sports
import type { Component, JSX } from "solid-js"

export const IconBallBasketballDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15c5.605 0 10.15-4.544 10.15-10.15S17.605 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.518 5.542A9.12 9.12 0 0 1 8.188 12m0 0a9.12 9.12 0 0 1-2.67 6.458M8.188 12H2.85m5.337 0H12m6.48-6.458A9.15 9.15 0 0 0 15.813 12m0 0a9.15 9.15 0 0 0 2.669 6.458M15.812 12H12m3.813 0h5.337M12 12V2.85M12 12v9.15"
			/>
		</svg>
	)
}

export default IconBallBasketballDuoSolid
