// contrast/development
import type { Component, JSX } from "solid-js"

export const IconAutomation1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".3">
				<path
					fill="currentColor"
					d="M15 18c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C16.602 15 17.068 15 18 15s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 16.602 21 17.068 21 18s0 1.398-.152 1.765a2 2 0 0 1-1.082 1.083C19.398 21 18.932 21 18 21s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.082C15 19.398 15 18.932 15 18Z"
				/>
				<path fill="currentColor" d="M14.85 6a3.15 3.15 0 1 1 6.3 0 3.15 3.15 0 0 1-6.3 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.004 18H9A6 6 0 0 1 9 6h5.85m-3.846 12a.6.6 0 0 0-.131-.37A12.5 12.5 0 0 0 8.66 15.5m2.343 2.5c0 .13-.044.262-.131.37A12.5 12.5 0 0 1 8.66 20.5M14.85 6a3.15 3.15 0 1 0 6.3 0 3.15 3.15 0 0 0-6.3 0ZM18 21c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C15 19.398 15 18.932 15 18s0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C16.602 15 17.068 15 18 15s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 16.602 21 17.068 21 18s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 21 18.932 21 18 21Z"
			/>
		</svg>
	)
}

export default IconAutomation1
