// solid/alerts
import type { Component, JSX } from "solid-js"

export const IconNotificationBellOff: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.822 9.526a8.207 8.207 0 0 1 14.168-4.93l2.303-2.303a1 1 0 1 1 1.414 1.414L18.624 6.79l-.003.003L7.173 18.241l-.002.003-3.464 3.463a1 1 0 0 1-1.414-1.414l2.135-2.135a2.59 2.59 0 0 1-1.281-3.127c.17-.51.289-.872.32-1.245z"
				fill="currentColor"
			/>
			<path
				d="M19.543 8.857a1 1 0 0 1 .652.856l.34 4.075c.03.374.15.735.32 1.246a2.587 2.587 0 0 1-2.17 3.387q-1.436.16-2.876.25a3.843 3.843 0 0 1-7.195 1.302 1 1 0 0 1 .174-1.18l9.703-9.704a1 1 0 0 1 1.052-.232Zm-5.803 9.91q-1.06.03-2.121.023l-.79.79a1.843 1.843 0 0 0 2.91-.813Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconNotificationBellOff
