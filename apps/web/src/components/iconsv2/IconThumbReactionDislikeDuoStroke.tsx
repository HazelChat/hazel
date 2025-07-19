// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconThumbReactionDislikeDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 11.064V12.5a2.5 2.5 0 0 0 5 0v-6a2.5 2.5 0 0 0-5 0zm0 0c-.002.813-.015 1.285-.1 1.742"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m8.839 16.83-.048.124a7 7 0 0 0-.157.426 3 3 0 0 0 .602 2.845c.07.08.151.162.315.326.095.095.142.142.184.176a1 1 0 0 0 1.382-.123c.035-.04.073-.095.15-.205l3.012-4.326c.64-.919.959-1.378 1.185-1.878q.303-.668.436-1.39c.085-.456.098-.928.1-1.741V8.268c-.004-1.333-.037-2.06-.327-2.63a3 3 0 0 0-1.311-1.311C13.72 4 12.88 4 11.2 4H7.691c-1.467 0-2.2 0-2.792.269a3 3 0 0 0-1.276 1.1c-.354.544-.462 1.27-.68 2.721l-.53 3.555c-.143.95-.214 1.424-.072 1.794a1.5 1.5 0 0 0 .66.766c.344.195.825.195 1.785.195h2.386c.372 0 .557 0 .694.026a1.5 1.5 0 0 1 1.199 1.748c-.026.137-.093.31-.226.656Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconThumbReactionDislikeDuoStroke
