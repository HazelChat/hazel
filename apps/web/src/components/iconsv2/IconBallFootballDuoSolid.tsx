// duo-solid/sports
import type { Component, JSX } from "solid-js"

export const IconBallFootballDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.59 3.41c-1.369-1.369-2.885-1.71-4.63-1.64a22.3 22.3 0 0 0-4.013.51c-2.25.509-4.584 1.48-6.384 3.28s-2.77 4.133-3.28 6.382a22.4 22.4 0 0 0-.51 4.014c-.07 1.745.272 3.262 1.64 4.63 1.369 1.37 2.886 1.711 4.631 1.64a22.4 22.4 0 0 0 4.013-.51c2.25-.509 4.583-1.48 6.383-3.28s2.77-4.133 3.28-6.383a22.3 22.3 0 0 0 .51-4.013c.07-1.745-.271-3.262-1.64-4.63Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m13.5 10.5-3 3m1.667-10.245a41.4 41.4 0 0 1 8.578 8.577m-17.487.331a41.4 41.4 0 0 0 8.578 8.579"
			/>
		</svg>
	)
}

export default IconBallFootballDuoSolid
