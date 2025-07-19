// duo-stroke/communication
import type { Component, JSX } from "solid-js"

export const IconEnvelopeArrowUpDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.197 7.761C2 8.721 2 10.006 2 12c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 20 7.2 20 10 20h4.379M22 11.465c-.002-1.694-.018-2.832-.197-3.704"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.428 17.412a13 13 0 0 1 2.192-2.275.6.6 0 0 1 .38-.135m2.571 2.41a13 13 0 0 0-2.19-2.275.6.6 0 0 0-.381-.135m0 0v6M10 4h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185c.157.308.269.643.348 1.032l-5.508 3.505c-1.557.99-2.335 1.486-3.171 1.678a5 5 0 0 1-2.248 0c-.836-.192-1.614-.688-3.171-1.678L2.197 7.762c.08-.389.191-.724.348-1.032A5 5 0 0 1 4.73 4.545C5.8 4 7.2 4 10 4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconEnvelopeArrowUpDuoStroke
