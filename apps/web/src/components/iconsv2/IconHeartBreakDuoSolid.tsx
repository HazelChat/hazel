// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconHeartBreakDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.458 2.42c2.154-.815 4.689-.49 6.542 1.416 1.852-1.903 4.386-2.225 6.54-1.412A6.92 6.92 0 0 1 23 8.944c0 3.944-2.508 7.208-4.956 9.41a22.7 22.7 0 0 1-3.552 2.613c-.517.305-.986.548-1.37.718a6 6 0 0 1-.541.21c-.14.044-.357.105-.581.105s-.44-.06-.58-.105a6 6 0 0 1-.541-.21 14 14 0 0 1-1.372-.718 22.7 22.7 0 0 1-3.55-2.614C3.508 16.153 1 12.888 1 8.944A6.925 6.925 0 0 1 5.458 2.42Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16c-1.155-1.06-1.74-2.436-1.992-3.952a.07.07 0 0 1 .032-.075l2.896-1.93a.12.12 0 0 0 .05-.118A11.5 11.5 0 0 0 12 5.427a6 6 0 0 0-1-1.164"
			/>
		</svg>
	)
}

export default IconHeartBreakDuoSolid
