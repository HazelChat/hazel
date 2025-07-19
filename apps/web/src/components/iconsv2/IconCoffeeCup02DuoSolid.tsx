// duo-solid/food
import type { Component, JSX } from "solid-js"

export const IconCoffeeCup02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.99 11H19a3 3 0 1 1 0 6h-2.487M6 6v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4m3 2v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4m3 2v-.066c0-.375.188-.726.5-.934s.5-.559.5-.934V4"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M3.568 9c-.252 0-.498 0-.706.017a2 2 0 0 0-.77.201 2 2 0 0 0-.874.874 2 2 0 0 0-.201.77C1 11.07 1 11.316 1 11.568v.785a9 9 0 0 0 18 0v-.785c0-.252 0-.498-.017-.706a2 2 0 0 0-.201-.77 2 2 0 0 0-.874-.874 2 2 0 0 0-.77-.201C16.93 9 16.684 9 16.432 9z"
			/>
		</svg>
	)
}

export default IconCoffeeCup02DuoSolid
