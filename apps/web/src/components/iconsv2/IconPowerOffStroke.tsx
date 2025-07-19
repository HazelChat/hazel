// stroke/general
import type { Component, JSX } from "solid-js"

export const IconPowerOffStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 8V2M7.556 4a9.15 9.15 0 0 0-4.706 8 9.12 9.12 0 0 0 2.68 6.47M16.444 4a9.2 9.2 0 0 1 2.026 1.53M2 22l3.53-3.53M22 2l-3.53 3.53m2.18 3.477c.324.938.5 1.945.5 2.993A9.15 9.15 0 0 1 12 21.15a9.1 9.1 0 0 1-2.993-.5M5.53 18.47 18.47 5.53"
				fill="none"
			/>
		</svg>
	)
}

export default IconPowerOffStroke
