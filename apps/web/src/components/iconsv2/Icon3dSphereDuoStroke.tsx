// duo-stroke/ar-&-vr
import type { Component, JSX } from "solid-js"

export const Icon3dSphereDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21.142 12.39c-3.803 1.492-8.033 1.884-12.082 1.461m0 0c-2.273-.237-4.376-.745-6.202-1.46m6.202 1.46c.171 2.647.706 5.097 1.513 7.188M9.06 13.851c-.238-3.67.185-7.448 1.513-10.89"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21.142 12.39c-3.803 1.492-8.033 1.884-12.082 1.461m0 0c-2.273-.237-4.376-.745-6.202-1.46m6.202 1.46c.171 2.647.706 5.097 1.513 7.188M9.06 13.851c-.238-3.67.185-7.448 1.513-10.89"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default Icon3dSphereDuoStroke
