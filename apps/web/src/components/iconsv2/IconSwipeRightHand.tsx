// solid/general
import type { Component, JSX } from "solid-js"

export const IconSwipeRightHand: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.227 1.08a3 3 0 0 0-3.75 1.982l-2.165 7.022a4.16 4.16 0 0 0-4.261-1.98 1.79 1.79 0 0 0-1.429 2.256l2.132 7.488c.825 2.899 3.556 4.76 6.349 5.368 2.794.61 6.034.046 7.917-2.391.977-1.266 1.786-2.995 1.881-4.7.049-.866-.085-1.757-.51-2.572-.43-.824-1.126-1.51-2.097-1.996l-3.602-1.803L18.21 4.83a3 3 0 0 0-1.983-3.75Z"
				fill="currentColor"
			/>
			<path
				d="M7.84 1.094a1 1 0 1 0-.849 1.811q.189.088.372.184a16 16 0 0 0-6.03 3.392 1 1 0 1 0 1.334 1.49A14 14 0 0 1 7.58 5.12l-.116.13a1 1 0 0 0 1.483 1.342c.643-.71 1.19-1.5 1.628-2.348q.102-.2.133-.415a1 1 0 0 0-.156-.836 1.3 1.3 0 0 0-.302-.363 11 11 0 0 0-2.41-1.535Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSwipeRightHand
