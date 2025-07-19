// contrast/media
import type { Component, JSX } from "solid-js"

export const IconHeadphonesOff1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="m16.421 14.308-1.048 3.658a2.378 2.378 0 0 0 4.571 1.31l1.05-3.658a2.378 2.378 0 0 0-4.573-1.31Z"
				/>
				<path
					fill="currentColor"
					d="M7.579 14.308a2.378 2.378 0 0 0-4.573 1.31l1.05 3.658q.073.253.193.475l3.8-3.8z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.994 15.618a2.378 2.378 0 0 0-4.573-1.31l-1.048 3.658a2.378 2.378 0 0 0 4.571 1.31zm0 0a9.5 9.5 0 0 0 .518-3.106 9.5 9.5 0 0 0-.722-3.643m.204 6.749-.008.022m-17.98-.023a2.378 2.378 0 0 1 4.573-1.309l.47 1.642m-5.043-.333.018.052m-.018-.052a9.5 9.5 0 0 1-.518-3.105A9.51 9.51 0 0 1 12 3a9.48 9.48 0 0 1 6.465 2.535M3.006 15.617l1.05 3.66q.073.252.193.474M2 22l2.249-2.249M22 2l-3.535 3.535m0 0L8.05 15.95m0 0-3.801 3.801"
			/>
		</svg>
	)
}

export default IconHeadphonesOff1
