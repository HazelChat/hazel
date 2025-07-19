// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowUpDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 5v16"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12 4a1.95 1.95 0 0 0-1.22.429 31.2 31.2 0 0 0-5.584 5.807A1 1 0 0 0 6 11.83h12a1 1 0 0 0 .804-1.594 31.2 31.2 0 0 0-5.584-5.807A1.95 1.95 0 0 0 12 4Z"
			/>
		</svg>
	)
}

export default IconArrowUpDuoSolid
