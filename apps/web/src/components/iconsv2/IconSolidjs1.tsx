// contrast/development
import type { Component, JSX } from "solid-js"

export const IconSolidjs1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="m4 15.963 11.659-3.124c6.262-1.678 6.831 6.443.553 8.13C11.245 22.162 7.364 18.953 4 15.964Z"
				/>
				<path
					fill="currentColor"
					d="M20.74 8.261 9.083 11.385c-6.262 1.678-6.832-6.443-.553-8.13 4.967-1.192 8.847 2.017 12.212 5.006Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m4 15.963 11.659-3.124c6.262-1.678 6.831 6.443.553 8.13C11.245 22.162 7.364 18.953 4 15.964Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.74 8.261 9.083 11.385c-6.262 1.678-6.832-6.443-.553-8.13 4.967-1.192 8.847 2.017 12.212 5.006Z"
			/>
		</svg>
	)
}

export default IconSolidjs1
