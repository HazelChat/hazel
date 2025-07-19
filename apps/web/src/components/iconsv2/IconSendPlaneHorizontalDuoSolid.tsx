// duo-solid/communication
import type { Component, JSX } from "solid-js"

export const IconSendPlaneHorizontalDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.13 6.015c-.703-2.391 1.538-4.632 3.93-3.863a55 55 0 0 1 12.875 6.073q.17.108.387.24c.45.272 1.016.616 1.46 1.005C21.428 10.04 22 10.844 22 12c0 1.157-.57 1.961-1.219 2.53-.443.39-1.01.733-1.459 1.006q-.217.13-.387.24A55 55 0 0 1 6.06 21.848c-2.393.768-4.634-1.472-3.93-3.863l1.255-4.268a1 1 0 0 1 .96-.718h5.489a1 1 0 1 0 0-2h-5.49a1 1 0 0 1-.96-.717z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 17.975a54 54 0 0 0 5.395-3.042C19.526 14.207 21 13.558 21 12c0-1.559-1.474-2.207-2.605-2.934A54 54 0 0 0 13 6.025"
			/>
		</svg>
	)
}

export default IconSendPlaneHorizontalDuoSolid
