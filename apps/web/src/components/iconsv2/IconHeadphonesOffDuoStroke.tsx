// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconHeadphonesOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.993 15.618a2.378 2.378 0 0 0-4.572-1.31l-1.049 3.658a2.378 2.378 0 1 0 4.572 1.31zm0 0a9.5 9.5 0 0 0 .519-3.106 9.5 9.5 0 0 0-.722-3.643m.203 6.749-.007.022m-17.98-.023a2.378 2.378 0 0 1 4.573-1.309l.47 1.643m-5.043-.334.018.052m-.018-.052a9.5 9.5 0 0 1-.518-3.105A9.51 9.51 0 0 1 12 3a9.48 9.48 0 0 1 6.465 2.535M3.006 15.617l1.05 3.66q.072.253.193.474"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 22 22 2"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadphonesOffDuoStroke
