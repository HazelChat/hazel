// solid/general
import type { Component, JSX } from "solid-js"

export const IconTools: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.874 1.732a1 1 0 0 1 .248 1.228l-.32.616a1.944 1.944 0 0 0 2.621 2.621l.617-.32a1 1 0 0 1 1.25 1.501l-1.815 2.343a4.416 4.416 0 0 1-7.779-1.64 4.42 4.42 0 0 1 1.583-4.557L16.62 1.71a1 1 0 0 1 1.253.023Z"
				fill="currentColor"
			/>
			<path
				d="m11.279 8.59-8.402 7.294a6 6 0 0 0-.437.401c-.738.778-1.008 1.73-.9 2.651.104.896.556 1.718 1.18 2.343.625.625 1.448 1.077 2.344 1.182.922.107 1.873-.163 2.651-.9.122-.116.245-.258.4-.436l7.296-8.404a5.9 5.9 0 0 1-2.611-1.522 5.9 5.9 0 0 1-1.521-2.61Z"
				fill="currentColor"
			/>
			<path
				d="M7.656 2.278a3.5 3.5 0 0 0-4.115 0A7 7 0 0 0 2.06 3.759a3.5 3.5 0 0 0 0 4.115c.163.224.38.442.657.717l1.356 1.356.668.669a1 1 0 0 0 1.361.05l4.551-3.935a1 1 0 0 0 .053-1.464l-.766-.766-1.566-1.567c-.276-.275-.493-.493-.718-.656Z"
				fill="currentColor"
			/>
			<path
				d="M16.706 15.527a1 1 0 1 0-1.414 1.415l5.156 5.156a1 1 0 0 0 1.415-1.414z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTools
