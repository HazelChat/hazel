// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconPinSlantDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m8.65 15.35-5.168 5.168"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M15.788 3.082a2.6 2.6 0 0 0-3.877.644L9.714 7.317a.47.47 0 0 1-.268.217.94.94 0 0 1-.504-.004 5.54 5.54 0 0 0-5.246 1.461 1.504 1.504 0 0 0-.14 1.967c1.343 1.79 2.79 3.505 4.386 5.1 1.596 1.596 3.31 3.044 5.1 4.387.6.449 1.438.39 1.967-.14a5.54 5.54 0 0 0 1.461-5.246.94.94 0 0 1-.003-.504.47.47 0 0 1 .216-.269l3.592-2.196a2.6 2.6 0 0 0 .644-3.877 39 39 0 0 0-5.131-5.131Z"
			/>
		</svg>
	)
}

export default IconPinSlantDuoSolid
