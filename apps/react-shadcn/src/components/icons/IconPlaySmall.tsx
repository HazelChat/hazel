// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPlaySmall: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.322 7.213c-1.074-.69-1.94-1.247-2.651-1.617-.713-.372-1.426-.643-2.171-.59a3.77 3.77 0 0 0-2.748 1.501c-.448.598-.605 1.344-.679 2.145C6 9.45 6 10.479 6 11.757v.486c0 1.278 0 2.307.073 3.105.074.801.231 1.547.679 2.145a3.77 3.77 0 0 0 2.748 1.5c.745.054 1.457-.217 2.17-.589.712-.37 1.578-.926 2.652-1.617l.384-.247c.929-.597 1.684-1.082 2.244-1.52.569-.443 1.055-.923 1.321-1.553a3.77 3.77 0 0 0 0-2.934c-.266-.63-.752-1.11-1.32-1.554-.561-.437-1.316-.922-2.245-1.52z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPlaySmall
