// duo-solid/medical
import type { Component, JSX } from "solid-js"

export const IconMedicinePillCapsuleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.485 3.515a6.25 6.25 0 0 0-8.841 0l-8.13 8.129a6.252 6.252 0 1 0 8.842 8.841l8.13-8.129a6.25 6.25 0 0 0 0-8.841Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M17.326 5.494a2.5 2.5 0 0 0-2.845.488L12.713 7.75a1 1 0 0 0 1.414 1.414l1.768-1.767a.5.5 0 0 1 .57-.098 1 1 0 1 0 .861-1.805Z"
			/>
			<path
				fill="currentColor"
				d="M8.993 7.58A1 1 0 1 0 7.58 8.993l7.427 7.427a1 1 0 0 0 1.414-1.414z"
			/>
		</svg>
	)
}

export default IconMedicinePillCapsuleDuoSolid
