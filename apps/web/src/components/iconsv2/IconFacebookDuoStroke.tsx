// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconFacebookDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3.354 7.22C3 8.23 3 9.485 3 12s0 3.77.354 4.78a6.3 6.3 0 0 0 3.865 3.866C8.23 21 9.486 21 12 21s3.77 0 4.78-.354a6.3 6.3 0 0 0 3.866-3.865C21 15.77 21 14.514 21 12s0-3.77-.354-4.78a6.3 6.3 0 0 0-3.865-3.866C15.77 3 14.514 3 12 3s-3.77 0-4.78.354a6.3 6.3 0 0 0-3.866 3.865Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M14.596 7h-.043c-.593 0-1.105 0-1.528.04-.448.041-.887.134-1.303.376-.62.36-1.1.922-1.394 1.58-.19.428-.264.877-.298 1.358-.032.447-.034.992-.034 1.646h-1.25a1 1 0 1 0 0 2h1.25v5.988c.545.01 1.198.012 2 .012v-6h2.75a1 1 0 1 0 0-2h-2.75c0-.672.002-1.139.028-1.503.027-.377.076-.563.13-.686a1.45 1.45 0 0 1 .574-.667c.065-.038.182-.085.483-.113C13.53 9 13.948 9 14.596 9a1 1 0 1 0 0-2Z"
			/>
			<path fill="currentColor" d="M11.026 22h-.065z" />
		</svg>
	)
}

export default IconFacebookDuoStroke
