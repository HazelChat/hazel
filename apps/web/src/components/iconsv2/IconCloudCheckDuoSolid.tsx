// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconCloudCheckDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.5 4a7.5 7.5 0 0 0-7.383 6.176A5.502 5.502 0 0 0 6.5 21h10a6.5 6.5 0 0 0 2.965-12.285A7.5 7.5 0 0 0 12.5 4Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m9 13.597 2.341 2.339A15 15 0 0 1 15.9 11"
			/>
		</svg>
	)
}

export default IconCloudCheckDuoSolid
