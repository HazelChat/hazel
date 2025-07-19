// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignHorizontalCenterDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 5v14"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M7.23 8.162a1 1 0 0 0-1.541.936q.093.95.126 1.902H3a1 1 0 1 0 0 2h2.815q-.033.953-.126 1.902a1 1 0 0 0 1.54.936 17.4 17.4 0 0 0 3.391-2.867c.24-.264.38-.607.38-.971s-.14-.707-.38-.97a17.4 17.4 0 0 0-3.39-2.868Z"
			/>
			<path
				fill="currentColor"
				d="M18.311 9.098a1 1 0 0 0-1.54-.936 17.4 17.4 0 0 0-3.391 2.867A1.44 1.44 0 0 0 13 12c0 .364.14.707.38.97a17.4 17.4 0 0 0 3.39 2.868 1 1 0 0 0 1.541-.936A30 30 0 0 1 18.185 13H21a1 1 0 1 0 0-2h-2.815q.033-.953.126-1.902Z"
			/>
		</svg>
	)
}

export default IconAlignHorizontalCenterDuoSolid
