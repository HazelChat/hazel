// duo-solid/users
import type { Component, JSX } from "solid-js"

export const IconPeopleFemaleFemaleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M6.004 9a3.87 3.87 0 0 0-3.807 3.19l-1.182 6.635A1 1 0 0 0 2 20h1.233l.295 1.1a2.563 2.563 0 0 0 4.954-.009L8.77 20H10a1 1 0 0 0 .985-1.174l-1.172-6.632A3.87 3.87 0 0 0 6.004 9Zm12 0a3.87 3.87 0 0 0-3.807 3.19l-1.181 6.635A1 1 0 0 0 14 20h1.233l.295 1.1a2.563 2.563 0 0 0 4.954-.009L20.77 20H22a1 1 0 0 0 .985-1.174l-1.172-6.632A3.87 3.87 0 0 0 18.004 9Z"
				clip-rule="evenodd"
			/>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M3 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
				<path fill="currentColor" d="M18 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
			</g>
		</svg>
	)
}

export default IconPeopleFemaleFemaleDuoSolid
