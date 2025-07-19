// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowRightCircleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.15 12c0-5.606-4.544-10.15-10.15-10.15S1.85 6.394 1.85 12 6.394 22.15 12 22.15c5.605 0 10.15-4.544 10.15-10.15Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.051 8a20.3 20.3 0 0 1 3.807 3.604A.63.63 0 0 1 16 12m-3.949 4a20.3 20.3 0 0 0 3.807-3.604A.63.63 0 0 0 16 12m0 0H8"
			/>
		</svg>
	)
}

export default IconArrowRightCircleDuoSolid
