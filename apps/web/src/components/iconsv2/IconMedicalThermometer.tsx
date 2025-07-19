// solid/medical
import type { Component, JSX } from "solid-js"

export const IconMedicalThermometer: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.182 3.16a4 4 0 1 1 5.657 5.657l-2.001 2.002-.01.01-.009.008-6.352 6.354c-.52.52-.89.895-1.291 1.184l-.175.12a5 5 0 0 1-.955.478l-.34.113c-.403.119-.823.169-1.36.211l-.582.042-1.82.132-2.236 2.236a1 1 0 0 1-1.414-1.414l2.236-2.237.13-1.82c.053-.733.087-1.258.201-1.74l.053-.203c.1-.342.238-.674.41-.987l.182-.307c.228-.354.513-.667.891-1.051l.411-.413zm-3.325 9.982a1 1 0 0 0-1.414 1.414l1.189 1.189.075.068a1 1 0 0 0 1.406-1.406l-.067-.076zm2.728-2.728a1 1 0 0 0-1.414 1.415l1.188 1.188.075.068a1 1 0 0 0 1.408-1.407l-.069-.075zm2.62-2.62a1 1 0 0 0-1.413 1.413l1.188 1.189.075.068a1 1 0 0 0 1.408-1.407l-.069-.075z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMedicalThermometer
