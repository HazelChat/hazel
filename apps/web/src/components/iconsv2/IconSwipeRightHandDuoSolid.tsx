// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconSwipeRightHandDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.51 1.576a1 1 0 0 1 1.33-.481c.867.406 1.677.922 2.41 1.535q.187.158.302.363a1 1 0 0 1 .156.836q-.03.214-.133.415a11 11 0 0 1-1.628 2.348 1 1 0 0 1-1.483-1.341l.116-.131a14 14 0 0 0-4.913 2.852 1 1 0 1 1-1.334-1.49 16 16 0 0 1 6.03-3.392 9 9 0 0 0-.372-.184 1 1 0 0 1-.481-1.33Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M16.227 1.08a3 3 0 0 0-3.751 1.982l-2.164 7.022a4.16 4.16 0 0 0-4.262-1.98 1.79 1.79 0 0 0-1.428 2.256l2.132 7.488c.825 2.899 3.556 4.76 6.349 5.368 2.794.61 6.033.046 7.916-2.391.978-1.266 1.786-2.995 1.882-4.7.049-.866-.085-1.757-.51-2.572-.43-.824-1.126-1.51-2.098-1.996l-3.601-1.803L18.21 4.83a3 3 0 0 0-1.983-3.75Z"
			/>
		</svg>
	)
}

export default IconSwipeRightHandDuoSolid
