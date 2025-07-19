// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconDangerSkullDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 2a8 8 0 0 0-8 8v4.419c0 1.374.88 2.595 2.184 3.03.487.162.816.618.816 1.132v.094A3.325 3.325 0 0 0 10.325 22h3.35A3.325 3.325 0 0 0 17 18.675v-.094c0-.514.329-.97.816-1.132A3.19 3.19 0 0 0 20 14.419V10a8 8 0 0 0-8-8Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.3 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.7 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
			/>
		</svg>
	)
}

export default IconDangerSkullDuoSolid
