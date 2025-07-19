// duo-solid/devices
import type { Component, JSX } from "solid-js"

export const IconLaptopDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.2 4H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 6.28 3 7.12 3 8.8V16h18V8.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C18.72 4 17.88 4 16.2 4Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M21 15H3a2 2 0 0 0-2 2 4 4 0 0 0 4 4h14a4 4 0 0 0 4-4 2 2 0 0 0-2-2Z"
			/>
		</svg>
	)
}

export default IconLaptopDuoSolid
