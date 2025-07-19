// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnRightDown1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 15.142a25.2 25.2 0 0 1-4.505 4.684.79.79 0 0 1-.99 0A25.2 25.2 0 0 1 10 15.142c.935.16 1.402.24 1.87.302a24 24 0 0 0 6.26 0c.468-.062.935-.142 1.87-.302Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 15.649V12c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C11.2 4 9.8 4 7 4H4m11 11.649q1.57 0 3.13-.205c.468-.062.935-.142 1.87-.303a25.2 25.2 0 0 1-4.505 4.684.79.79 0 0 1-.99 0A25.2 25.2 0 0 1 10 15.141c.935.16 1.402.241 1.87.303q1.56.204 3.13.205Z"
			/>
		</svg>
	)
}

export default IconArrowTurnRightDown1
