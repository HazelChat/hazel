// solid/navigation
import type { Component, JSX } from "solid-js"

export const IconEarthGlobeTimezone: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M22.15 12c0 .735-.079 1.453-.228 2.145a5.5 5.5 0 0 1-7.778 7.778c-.692.149-1.41.227-2.144.227-5.606 0-10.15-4.544-10.15-10.15 0-1.288.24-2.522.68-3.658a10.15 10.15 0 0 1 11.598-6.268c4.584.978 8.022 5.05 8.022 9.926Zm-10.816-1.982c2.053-1.143 3.503-3.193 3.653-5.603a8.154 8.154 0 0 1 5.112 8.5 5.5 5.5 0 0 0-7.184 7.184q-.45.051-.915.051a8.15 8.15 0 0 1-8.102-7.26 4.12 4.12 0 0 0 2.193 1.555 2.744 2.744 0 1 0 4.908-2.261 4.1 4.1 0 0 0 .335-2.166ZM19 16.4a1 1 0 1 0-2 0v2.1a1 1 0 0 0 1 1h1.6a1 1 0 1 0 0-2H19z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconEarthGlobeTimezone
