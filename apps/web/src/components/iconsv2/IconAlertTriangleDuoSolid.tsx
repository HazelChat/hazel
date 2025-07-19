// duo-solid/alerts
import type { Component, JSX } from "solid-js"

export const IconAlertTriangleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.218 2.364a4.55 4.55 0 0 1 3.563 0c.486.206.972.574 1.426.988.468.426.96.956 1.457 1.547.994 1.182 2.046 2.662 3 4.179.956 1.517 1.828 3.095 2.454 4.479.313.69.572 1.35.747 1.939.17.568.289 1.155.254 1.67a4.63 4.63 0 0 1-1.818 3.373c-.431.327-1.026.551-1.63.717-.629.174-1.373.312-2.181.42-1.617.218-3.56.324-5.49.324s-3.873-.106-5.49-.323a17 17 0 0 1-2.18-.42c-.605-.167-1.2-.39-1.631-.718A4.63 4.63 0 0 1 .88 17.166c-.035-.515.084-1.102.253-1.67.176-.59.435-1.248.748-1.94.626-1.383 1.498-2.961 2.453-4.478s2.007-2.997 3-4.18c.497-.59.99-1.12 1.458-1.546.454-.414.94-.782 1.425-.988Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 13V9m0 7.375v.001"
			/>
		</svg>
	)
}

export default IconAlertTriangleDuoSolid
