// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconDiscountBadgeDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.868 21.005a3.925 3.925 0 0 1-5.736 0 1.93 1.93 0 0 0-1.472-.61 3.925 3.925 0 0 1-4.055-4.055 1.93 1.93 0 0 0-.61-1.472 3.925 3.925 0 0 1 0-5.736 1.93 1.93 0 0 0 .61-1.472A3.925 3.925 0 0 1 7.66 3.605a1.93 1.93 0 0 0 1.472-.61 3.925 3.925 0 0 1 5.736 0c.38.406.916.628 1.472.61a3.925 3.925 0 0 1 4.055 4.055 1.93 1.93 0 0 0 .61 1.472 3.925 3.925 0 0 1 0 5.736 1.93 1.93 0 0 0-.61 1.472 3.925 3.925 0 0 1-4.055 4.055 1.93 1.93 0 0 0-1.472.61Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 15.364 15.364 9m-6.114.25h.01m5.854 5.864h.01M9.5 9.25a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Zm5.864 5.864a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Z"
			/>
		</svg>
	)
}

export default IconDiscountBadgeDuoSolid
