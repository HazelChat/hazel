// duo-solid/navigation
import type { Component, JSX } from "solid-js"

export const IconNavigationSlantDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.108 2.044a1.556 1.556 0 0 1 1.848 1.848 52.2 52.2 0 0 1-6.866 16.87l-.306.485c-.754 1.198-2.579.89-2.897-.49l-1.348-5.84a1.94 1.94 0 0 0-1.456-1.457l-5.84-1.347c-1.38-.319-1.689-2.144-.49-2.898l.484-.305a52.2 52.2 0 0 1 16.87-6.866Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.939 20.715a.592.592 0 0 1-1.077-.183l-1.348-5.84a2.94 2.94 0 0 0-2.206-2.206l-5.84-1.348a.591.591 0 0 1-.183-1.077"
			/>
		</svg>
	)
}

export default IconNavigationSlantDuoSolid
