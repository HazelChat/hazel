// duo-solid/devices
import type { Component, JSX } from "solid-js"

export const IconImacDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m9 22 .5-5M9 22h6m-6 0H8m1.5-5H4.4c-.84 0-1.26 0-1.581-.163a1.5 1.5 0 0 1-.656-.656C2 15.861 2 15.441 2 14.6V13h20v1.6c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.656c-.32.163-.74.163-1.581.163h-5.1m-5 0h5m0 0 .5 5m0 0h1"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M4.364 1c-.39 0-.74 0-1.03.024a2.5 2.5 0 0 0-.969.248 2.5 2.5 0 0 0-1.093 1.093 2.5 2.5 0 0 0-.248.968C1 3.625 1 3.975 1 4.363V13a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4.364c0-.39 0-.74-.024-1.03a2.5 2.5 0 0 0-.248-.969 2.5 2.5 0 0 0-1.093-1.093 2.5 2.5 0 0 0-.968-.248C20.375 1 20.025 1 19.637 1z"
			/>
		</svg>
	)
}

export default IconImacDuoSolid
