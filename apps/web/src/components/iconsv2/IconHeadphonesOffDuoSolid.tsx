// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconHeadphonesOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M12 4a8.51 8.51 0 0 0-8.502 8.101 3.38 3.38 0 0 1 5.042 1.932l.47 1.642a1 1 0 0 1-.253.983l-3.801 3.8a1 1 0 0 1-1.588-.232 3.4 3.4 0 0 1-.274-.674l-1.042-3.634a10.5 10.5 0 0 1-.564-3.406C1.488 6.706 6.194 2 12 2a10.48 10.48 0 0 1 7.145 2.802 1 1 0 0 1-1.36 1.466A8.48 8.48 0 0 0 12 4Z"
				/>
				<path
					fill="currentColor"
					d="M21.713 8.486a1 1 0 0 0-1.847.767c.366.883.589 1.842.636 2.848a3.38 3.38 0 0 0-5.042 1.932l-1.05 3.657a3.378 3.378 0 1 0 6.495 1.862l1.042-3.633a10.5 10.5 0 0 0 .564-3.407c0-1.424-.284-2.784-.799-4.026Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 22 22 2"
			/>
		</svg>
	)
}

export default IconHeadphonesOffDuoSolid
