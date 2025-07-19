// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMergeDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 7.782V13l-6 7m12 0-3.429-4"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12 3c-.372 0-.739.13-1.035.376a21.6 21.6 0 0 0-3.78 4.074 1 1 0 0 0 .897 1.577l2.022-.167a23 23 0 0 1 3.792 0l2.022.167a1 1 0 0 0 .896-1.577 21.6 21.6 0 0 0-3.779-4.074A1.62 1.62 0 0 0 12 3Z"
			/>
		</svg>
	)
}

export default IconMergeDuoSolid
