// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconRotateRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.26 7.017A8 8 0 1 0 19.748 14"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M17.793 1.67a1 1 0 0 0-.921.59l-.243.539a23 23 0 0 1-2.311 4.003l-.346.48a1 1 0 0 0 .931 1.577 16 16 0 0 0 3.808-.943c.155-.06.454-.182.703-.429.302-.3.48-.732.407-1.235a16 16 0 0 0-1.118-3.975 1 1 0 0 0-.91-.607Z"
			/>
		</svg>
	)
}

export default IconRotateRightDuoSolid
