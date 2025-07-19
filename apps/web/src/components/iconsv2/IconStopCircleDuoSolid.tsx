// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconStopCircleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M10.574 8.25h2.852c.258 0 .494 0 .692.016.213.018.446.057.676.175.33.168.598.435.765.765.118.23.158.463.175.676.016.198.016.434.016.692v2.852c0 .258 0 .494-.016.692a1.8 1.8 0 0 1-.175.676 1.75 1.75 0 0 1-.764.765c-.23.118-.464.158-.677.175-.198.016-.434.016-.692.016h-2.852c-.258 0-.494 0-.692-.016a1.8 1.8 0 0 1-.676-.175 1.75 1.75 0 0 1-.765-.764 1.8 1.8 0 0 1-.175-.677 9 9 0 0 1-.016-.692v-2.852c0-.258 0-.494.016-.692a1.8 1.8 0 0 1 .175-.676 1.75 1.75 0 0 1 .765-.765 1.8 1.8 0 0 1 .676-.175c.198-.016.434-.016.692-.016Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconStopCircleDuoSolid
