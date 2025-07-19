// solid/editing
import type { Component, JSX } from "solid-js"

export const IconDeleteBackwardLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M9.157 4c-.48 0-.868 0-1.265.093a3.7 3.7 0 0 0-.994.401c-.35.21-.607.458-.92.76l-.048.048a34 34 0 0 0-4.553 5.445A2.24 2.24 0 0 0 1 12c0 .427.119.87.377 1.253a34 34 0 0 0 4.553 5.445l.049.048c.312.302.57.55.919.76.295.175.66.323.994.401.397.094.786.093 1.265.093h7.883c.666 0 1.226 0 1.683-.037.48-.04.934-.124 1.366-.344a3.5 3.5 0 0 0 1.53-1.53c.22-.432.305-.887.344-1.365.037-.458.037-1.018.037-1.684V8.96c0-.666 0-1.225-.037-1.683-.04-.48-.124-.934-.344-1.366a3.5 3.5 0 0 0-1.53-1.53c-.432-.22-.887-.304-1.366-.344C18.266 4 17.706 4 17.04 4zm6.136 4.293a1 1 0 1 1 1.414 1.414L14.414 12l2.293 2.293a1 1 0 0 1-1.414 1.414L13 13.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L11.586 12 9.293 9.707a1 1 0 0 1 1.414-1.414L13 10.586z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDeleteBackwardLeft
