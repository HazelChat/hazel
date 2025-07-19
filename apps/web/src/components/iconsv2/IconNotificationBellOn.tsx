// solid/alerts
import type { Component, JSX } from "solid-js"

export const IconNotificationBellOn: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.822 9.526a8.207 8.207 0 0 1 16.358 0l.355 4.262c.03.374.15.735.32 1.246a2.587 2.587 0 0 1-2.17 3.387q-1.436.16-2.876.25a3.843 3.843 0 0 1-7.616 0q-1.44-.09-2.877-.25a2.588 2.588 0 0 1-2.17-3.39c.171-.51.29-.872.32-1.245zm6.44 9.24a1.843 1.843 0 0 0 3.478 0l-.294.008a61 61 0 0 1-3.184-.008Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconNotificationBellOn
