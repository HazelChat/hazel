// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconFigmaDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.167 1a3.833 3.833 0 1 0 0 7.667 3.833 3.833 0 1 0 0 7.666A3.833 3.833 0 1 0 12 20.167v-11.5h3.834a3.833 3.833 0 0 0 0-7.667z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M12 12.5a3.833 3.833 0 1 1 7.667 0 3.833 3.833 0 0 1-7.667 0Z" />
		</svg>
	)
}

export default IconFigmaDuoSolid
