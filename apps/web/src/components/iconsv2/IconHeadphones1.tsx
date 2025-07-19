// contrast/media
import type { Component, JSX } from "solid-js"

export const IconHeadphones1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="m19.944 19.277 1.05-3.657a2.378 2.378 0 0 0-4.573-1.311l-1.048 3.657a2.378 2.378 0 0 0 4.571 1.311Z"
				/>
				<path
					fill="currentColor"
					d="M8.627 17.966 7.58 14.31a2.378 2.378 0 1 0-4.572 1.31l1.049 3.658a2.378 2.378 0 1 0 4.571-1.31Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.993 15.618a2.378 2.378 0 0 0-4.572-1.31l-1.049 3.658a2.378 2.378 0 1 0 4.572 1.31zm0 0a9.5 9.5 0 0 0 .519-3.106 9.512 9.512 0 1 0-19.024 0c0 1.088.182 2.132.518 3.105m17.987.001-.007.022m-17.98-.023a2.378 2.378 0 0 1 4.573-1.309l1.048 3.658a2.378 2.378 0 0 1-4.571 1.31zm0 0 .018.052"
			/>
		</svg>
	)
}

export default IconHeadphones1
