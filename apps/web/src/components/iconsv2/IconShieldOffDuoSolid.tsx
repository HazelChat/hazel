// duo-solid/security
import type { Component, JSX } from "solid-js"

export const IconShieldOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M13.26 1.427a4 4 0 0 0-2.717 0L5.155 3.373a4 4 0 0 0-2.638 3.608l-.127 3.31a12 12 0 0 0 2.91 8.305 1 1 0 0 0 1.464.054L19.914 5.5a1 1 0 0 0-.094-1.497 4 4 0 0 0-1.094-.602z"
				/>
				<path
					fill="currentColor"
					d="M21.525 9.06a1 1 0 0 0-1.705-.631L8.495 19.754a1 1 0 0 0 .212 1.576l1.25.713a4 4 0 0 0 3.887.042l1.489-.806a12 12 0 0 0 6.25-11.472z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconShieldOffDuoSolid
