// duo-stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserEditDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h3.247"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.96 19.812c.012-.35.018-.525.062-.69q.058-.219.179-.412c.09-.144.214-.268.462-.516l5.973-5.973a.9.9 0 0 1 1.12-.122c.43.274.795.636 1.074 1.063l.02.03a.94.94 0 0 1-.122 1.18l-5.918 5.917c-.257.257-.386.386-.536.478a1.5 1.5 0 0 1-.43.18c-.17.042-.352.043-.716.045L12.922 21z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserEditDuoStroke
