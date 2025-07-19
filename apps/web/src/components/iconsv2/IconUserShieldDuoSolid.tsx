// duo-solid/users
import type { Component, JSX } from "solid-js"

export const IconUserShieldDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.983 22a7.5 7.5 0 0 1-1.976-5.405l.027-.618A4 4 0 0 1 11.653 14H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z" />
			<path
				fill="currentColor"
				d="M20.472 14.192a2.09 2.09 0 0 1 1.467 1.8l.04.452c.206 2.345-1.115 4.537-3.272 5.56l-.284.136a2.19 2.19 0 0 1-1.913-.02l-.327-.163c-2.017-1.008-3.275-3.05-3.178-5.27l.027-.617c.04-.893.651-1.628 1.474-1.888l2.305-.73c.43-.136.893-.136 1.323 0z"
			/>
		</svg>
	)
}

export default IconUserShieldDuoSolid
