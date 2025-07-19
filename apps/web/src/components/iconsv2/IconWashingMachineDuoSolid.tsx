// duo-solid/appliances
import type { Component, JSX } from "solid-js"

export const IconWashingMachineDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M7.161 1h9.678c.527 0 .982 0 1.356.03.395.033.789.104 1.167.297a3 3 0 0 1 1.311 1.311c.193.378.264.772.296 1.167.031.375.031.83.031 1.356V7H3V5.161c0-.527 0-.981.03-1.356.033-.395.104-.789.297-1.167a3 3 0 0 1 1.311-1.311c.378-.193.772-.264 1.167-.296C6.18 1 6.635 1 7.161 1Z"
				/>
				<path
					fill="currentColor"
					d="M3 9v9.839c0 .527 0 .982.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h9.678c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356V9z"
				/>
			</g>
			<path fill="currentColor" d="M6 4a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1Z" />
			<path fill="currentColor" d="M13 4a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" />
			<path fill="currentColor" d="M17 3a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z" />
			<path fill="currentColor" d="M12 10.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
		</svg>
	)
}

export default IconWashingMachineDuoSolid
