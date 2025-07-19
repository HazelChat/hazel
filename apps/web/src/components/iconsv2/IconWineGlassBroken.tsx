// solid/food
import type { Component, JSX } from "solid-js"

export const IconWineGlassBroken: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.994 1h-.692a1 1 0 0 0-.868.502A11 11 0 0 0 5 6.89c0 3.561 2.361 6.579 6 7.048V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-7.063c3.639-.47 6-3.487 6-7.048 0-1.914-.535-3.82-1.434-5.387A1 1 0 0 0 16.698 1h-5.737c.8.906 1.431 1.994 1.723 3.375a1 1 0 0 1-.419 1.037l-1.135.765c.15.43.383.806.699 1.114a1 1 0 0 1-1.397 1.431C9.626 7.935 9.176 6.94 9.005 5.9a1 1 0 0 1 .428-.992l1.12-.754c-.447-1.287-1.35-2.24-2.56-3.154Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconWineGlassBroken
