// duo-solid/navigation
import type { Component, JSX } from "solid-js"

export const IconMapPin02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21v-8"
				opacity=".28"
			/>
			<path fill="currentColor" d="M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
		</svg>
	)
}

export default IconMapPin02DuoSolid
