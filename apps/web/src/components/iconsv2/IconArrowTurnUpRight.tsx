// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnUpRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 20a1 1 0 1 0 2 0v-3c0-1.417 0-2.419.065-3.203.063-.772.182-1.243.371-1.613a4 4 0 0 1 1.748-1.748c.37-.189.842-.308 1.613-.371C9.581 10 10.583 10 12 10h2.627q-.044 1.003-.175 2c-.058.443-.134.889-.296 1.83a1 1 0 0 0 1.58.974 26.2 26.2 0 0 0 4.87-4.684 1.79 1.79 0 0 0 0-2.24 26.2 26.2 0 0 0-4.87-4.684 1 1 0 0 0-1.58.973c.162.942.238 1.388.296 1.831q.132.997.175 2h-2.67c-1.364 0-2.448 0-3.322.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359C3 14.509 3 15.593 3 16.956z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowTurnUpRight
