// duo-solid/food
import type { Component, JSX } from "solid-js"

export const IconEggBoiledDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.5c-1.34 0-2.536.619-3.533 1.486-.997.869-1.86 2.04-2.564 3.301-1.4 2.505-2.292 5.575-2.292 7.824a8.389 8.389 0 1 0 16.778 0c0-2.25-.892-5.32-2.291-7.824-.705-1.26-1.568-2.432-2.565-3.3S13.341 1.5 12 1.5Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M7.5 14a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconEggBoiledDuoSolid
