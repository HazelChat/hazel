// duo-solid/food
import type { Component, JSX } from "solid-js"

export const IconWineGlassBrokenDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 13v9m0 0h4m-4 0H8"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M7.994 1h-.692a1 1 0 0 0-.868.502A11 11 0 0 0 5 6.89C5 10.767 7.8 14 12 14s7-3.233 7-7.111c0-1.914-.535-3.82-1.434-5.387A1 1 0 0 0 16.698 1h-5.737c.8.906 1.431 1.994 1.723 3.375a1 1 0 0 1-.419 1.037l-1.135.765c.15.43.383.806.699 1.114a1 1 0 0 1-1.397 1.431C9.626 7.935 9.176 6.94 9.005 5.9a1 1 0 0 1 .428-.992l1.12-.754c-.447-1.287-1.35-2.24-2.56-3.154Z"
			/>
		</svg>
	)
}

export default IconWineGlassBrokenDuoSolid
