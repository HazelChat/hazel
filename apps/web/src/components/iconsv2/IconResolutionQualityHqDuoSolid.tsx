// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconResolutionQualityHqDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7 3a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.745 8.544v3.503m0 0h3.504m-3.504 0v3.003m3.504-3.003V8.544m0 3.503v3.003m5.172-.924v1.533m-1.67-5.565a1.752 1.752 0 1 1 3.504 0v2.28a1.752 1.752 0 0 1-3.503 0z"
			/>
		</svg>
	)
}

export default IconResolutionQualityHqDuoSolid
