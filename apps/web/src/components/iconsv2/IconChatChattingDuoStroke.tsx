// duo-stroke/communication
import type { Component, JSX } from "solid-js"

export const IconChatChattingDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.193 18.866c.143 0 .306.012.632.036l1.938.138c.771.055 1.157.083 1.446-.054.253-.12.457-.324.577-.577.137-.289.11-.675.054-1.446l-.138-1.938a11 11 0 0 1-.036-.632c-.002-.232-.005-.15.013-.38.011-.143.088-.685.24-1.768Q21 11.684 21 11.1A8.1 8.1 0 0 0 5.642 7.5"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.4 21c1.606 0 3.047-.7 4.037-1.813a5.4 5.4 0 1 0-9.37-2.73c.096.598.144.898.152.99.012.14.011.108.01.248 0 .093-.008.204-.023.427l-.1 1.386c-.036.515-.055.772.037.964a.8.8 0 0 0 .385.385c.192.091.45.073.964.036l1.385-.099c.224-.015.335-.024.428-.024.14 0 .108-.001.247.011.093.008.393.056.992.152Q7.963 21 8.4 21Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconChatChattingDuoStroke
