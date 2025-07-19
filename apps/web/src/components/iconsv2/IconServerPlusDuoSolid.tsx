// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconServerPlusDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M2 6.4A3.4 3.4 0 0 1 5.4 3h13.2A3.4 3.4 0 0 1 22 6.4v1.2a3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 7.6z"
				/>
				<path
					fill="currentColor"
					d="M2 16.4A3.4 3.4 0 0 1 5.4 13h13.2q.105 0 .206.006A3 3 0 0 0 16 16a3 3 0 0 0-2.236 5H5.4A3.4 3.4 0 0 1 2 17.6z"
				/>
			</g>
			<path fill="currentColor" d="M14 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
			<path fill="currentColor" d="M18 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
			<path
				fill="currentColor"
				d="M20 16a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2z"
			/>
		</svg>
	)
}

export default IconServerPlusDuoSolid
