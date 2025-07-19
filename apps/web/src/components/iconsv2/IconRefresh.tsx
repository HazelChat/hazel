// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconRefresh: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.51 1.47a1 1 0 0 1 .91.607 16 16 0 0 1 1.118 3.975 1.48 1.48 0 0 1-.917 1.588 16 16 0 0 1-4.001 1.02 1 1 0 0 1-.932-1.577l.358-.498q.362-.504.697-1.026a7.001 7.001 0 0 0-9.605 7.825 1 1 0 1 1-1.96.397 9.001 9.001 0 0 1 12.574-9.962q.309-.593.585-1.202l.251-.558a1 1 0 0 1 .922-.589Z"
				fill="currentColor"
			/>
			<path
				d="M19.757 9.804a1 1 0 0 1 1.14.837 9.001 9.001 0 0 1-12.65 9.54q-.308.59-.584 1.198l-.252.558a1 1 0 0 1-1.83-.018 16 16 0 0 1-1.12-3.975 1.48 1.48 0 0 1 .918-1.588 16 16 0 0 1 4.001-1.019 1 1 0 0 1 .932 1.577l-.358.497q-.363.505-.698 1.03a7.001 7.001 0 0 0 9.664-7.497 1 1 0 0 1 .837-1.14Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconRefresh
