// duo-solid/weather
import type { Component, JSX } from "solid-js"

export const IconCloudMoonDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M16.5 1a6.5 6.5 0 0 0-6.2 4.539q.396-.039.8-.039a8.13 8.13 0 0 1 7.31 4.566 7.3 7.3 0 0 1 2.341 2.351A6.5 6.5 0 0 0 23 7.5v-.041a1 1 0 0 0-1.501-.86A3 3 0 0 1 17.4 2.501a1 1 0 0 0-.86-1.5z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M11.1 7.25q-.33 0-.653.033a6.39 6.39 0 0 0-5.644 5.297A4.651 4.651 0 0 0 5.9 21.75h8.667a5.517 5.517 0 0 0 2.477-10.447A6.385 6.385 0 0 0 11.1 7.25Z"
			/>
		</svg>
	)
}

export default IconCloudMoonDuoSolid
