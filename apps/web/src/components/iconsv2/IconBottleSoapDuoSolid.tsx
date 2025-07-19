// duo-solid/medical
import type { Component, JSX } from "solid-js"

export const IconBottleSoapDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M12 1a1 1 0 0 1 1 1v2h1l.204.01A2 2 0 0 1 16 6v1.126c1.725.444 3 2.01 3 3.874v9.5a2.5 2.5 0 0 1-2.5 2.5h-9a2.5 2.5 0 0 1-2.487-2.244L5 20.5V11a4 4 0 0 1 3-3.874V6a2 2 0 0 1 2-2h1V2a1 1 0 0 1 1-1ZM9 9a2 2 0 0 0-2 2v9.5l.01.1a.5.5 0 0 0 .49.4h9a.5.5 0 0 0 .5-.5V11a2 2 0 0 0-2-2zm1-2h4V6h-4z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M16.419 1c1.289 0 2.442.773 2.94 1.944l.09.24.028.098a1 1 0 0 1-1.888.63l-.037-.096-.034-.09a1.19 1.19 0 0 0-1.1-.726H9.5a1 1 0 0 1 0-2z"
			/>
			<path
				fill="currentColor"
				d="M5.955 13.45c1.44-.473 2.625-.543 3.682-.35 1.101.2 1.987.678 2.746 1.088.784.425 1.443.785 2.248.974.779.183 1.752.215 3.11-.15A1 1 0 0 1 19 15.98v4.52a2.5 2.5 0 0 1-2.244 2.487L16.5 23h-9A2.5 2.5 0 0 1 5 20.5v-6.008l.012-.156a1 1 0 0 1 .651-.785z"
			/>
		</svg>
	)
}

export default IconBottleSoapDuoSolid
