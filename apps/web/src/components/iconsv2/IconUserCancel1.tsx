// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserCancel1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path fill="currentColor" d="M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
				<path
					fill="currentColor"
					d="M2 19a5 5 0 0 1 5-5h5.435v.004q.047-.003.095-.004a1 1 0 0 1 .864.496h.005q.194.337.48.625l.378.379-.378.379a3 3 0 0 0 .123 4.36 1 1 0 0 1-.743 1.757V22H5a3 3 0 0 1-3-3Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.53 15H7a4 4 0 0 0-4 4 2 2 0 0 0 2 2h8.354M21 13l-2.5 2.5m0 0L16 18m2.5-2.5L21 18m-2.5-2.5L16 13m-1-6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserCancel1
