// stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconProjectorStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 15c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C2 13.398 2 12.932 2 12s0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C3.602 9 4.068 9 5 9h4.354M5 15h4.354M5 15v1m14-1c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C22 13.398 22 12.932 22 12s0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C20.398 9 19.932 9 19 9h-4.354M19 15h-4.354M19 15v1m-4.354-7A4 4 0 0 0 12 8a4 4 0 0 0-2.646 1m5.292 0A4 4 0 0 1 16 12a4 4 0 0 1-1.354 3m0 0c-.705.622-1.632 1-2.646 1a4 4 0 0 1-2.646-1m0 0A4 4 0 0 1 8 12a4 4 0 0 1 1.354-3m9.656 3H19"
				fill="none"
			/>
		</svg>
	)
}

export default IconProjectorStroke
