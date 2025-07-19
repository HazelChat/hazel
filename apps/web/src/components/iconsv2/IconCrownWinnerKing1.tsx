// contrast/general
import type { Component, JSX } from "solid-js"

export const IconCrownWinnerKing1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.573 6.94c-.142-.616.611-1.034 1.058-.587 2.555 2.556 6.89 1.666 8.233-1.69l.765-1.912a.4.4 0 0 1 .742 0l.765 1.912c1.342 3.356 5.677 4.246 8.232 1.69.447-.447 1.2-.03 1.058.587l-2.484 10.767a22.62 22.62 0 0 0-15.884 0z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19.23 21.5a20.6 20.6 0 0 0-14.46 0m15.172-3.793L22.426 6.94c.143-.616-.61-1.034-1.058-.587-2.555 2.556-6.89 1.666-8.232-1.69l-.765-1.912a.4.4 0 0 0-.742 0l-.765 1.912C9.522 8.02 5.186 8.91 2.631 6.353c-.447-.447-1.2-.03-1.058.587l2.485 10.767a22.62 22.62 0 0 1 15.884 0Z"
			/>
		</svg>
	)
}

export default IconCrownWinnerKing1
