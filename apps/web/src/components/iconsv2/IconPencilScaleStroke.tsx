// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconPencilScaleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 18h4m-4-8h4m-4-4h3m-3 8h3m.2 8h2.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 20.48 21 19.92 21 18.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 2 18.92 2 17.8 2h-2.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C12 3.52 12 4.08 12 5.2v13.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C13.52 22 14.08 22 15.2 22ZM5.282 1.5 6.98 3.193c.243.242.364.363.45.504q.117.189.168.405c.039.161.038.333.038.676L7.6 20.948v.077a1.41 1.41 0 0 1-1.161 1.348l-.053.01a5.55 5.55 0 0 1-2.296-.007A1.38 1.38 0 0 1 3 21.023l.036-16.27c0-.33 0-.496.037-.652q.05-.21.159-.394c.082-.139.196-.259.424-.499z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPencilScaleStroke
