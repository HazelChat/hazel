// solid/weather
import type { Component, JSX } from "solid-js"

export const IconCloudLightning: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.5 2a7.5 7.5 0 0 1 6.965 4.715 6.502 6.502 0 0 1-1.963 12.209 3.38 3.38 0 0 0-.01-3.27c-.573-1.033-1.57-1.608-2.548-1.767l-.198-.032.795-1.168a3 3 0 0 0-4.962-3.374l-3.041 4.473a3.38 3.38 0 0 0-.204 3.572A3.5 3.5 0 0 0 9.305 19H6.5A5.5 5.5 0 0 1 5.117 8.176 7.5 7.5 0 0 1 7.434 3.97 7.47 7.47 0 0 1 12.5 2Z"
				fill="currentColor"
			/>
			<path
				d="M13.887 11.562a1 1 0 1 0-1.654-1.124l-3.052 4.488A1.38 1.38 0 0 0 9.09 16.4a1.55 1.55 0 0 0 1.124.772l3.23.524-2.87 3.69a1 1 0 1 0 1.58 1.228l3.477-4.471.022-.03a1.38 1.38 0 0 0 .09-1.488 1.55 1.55 0 0 0-1.119-.764l-3.297-.534z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCloudLightning
