// solid/building
import type { Component, JSX } from "solid-js"

export const IconBathTub: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 1a4 4 0 0 1 4 4h1a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2h1a2 2 0 0 0-4 0v5h18a1 1 0 0 1 .707 1.707c-.142.142-.23.23-.29.294l-.118.137c-.113.15-.196.32-.245.5l-.038.183c-.013.09-.016.193-.016.593V15.2c0 .824.001 1.502-.044 2.052-.04.492-.12.95-.306 1.38l-.085.184a4 4 0 0 1-1.473 1.594l-.276.154a3.4 3.4 0 0 1-.829.288 1 1 0 0 1-1.694.855l-.709-.709L16.2 21H7.8l-.385-.002-.708.709a1 1 0 0 1-1.695-.855 3.5 3.5 0 0 1-.645-.202l-.183-.085a4 4 0 0 1-1.594-1.473l-.154-.276c-.248-.485-.346-1.002-.392-1.564C1.999 16.702 2 16.024 2 15.2v-1.786c0-.2 0-.326-.003-.413l-.013-.18a1.5 1.5 0 0 0-.18-.527l-.103-.156A2 2 0 0 0 1.583 12l-.29-.294a1 1 0 0 1 .558-1.696L2 10V5a4 4 0 0 1 4-4Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBathTub
