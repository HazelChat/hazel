// duo-stroke/food
import type { Component, JSX } from "solid-js"

export const IconChefHatDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.885 6.042a4.002 4.002 0 0 0-7.77 0A4.5 4.5 0 1 0 7 14.972V18.6c.001.84.001 1.26.164 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163h5.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581v-3.627a4.5 4.5 0 1 0-1.116-8.931Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 17h4m-4 0v-3m0 3H7m7 0v-5m0 5h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconChefHatDuoStroke
