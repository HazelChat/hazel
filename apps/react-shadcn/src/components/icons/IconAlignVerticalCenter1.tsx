// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignVerticalCenter1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M11.703 9.88c-1.017-.925-1.925-2-2.703-3.196a30.5 30.5 0 0 0 6 0 16.4 16.4 0 0 1-2.703 3.197A.44.44 0 0 1 12 10a.44.44 0 0 1-.297-.12Z"
				/>
				<path
					fill="currentColor"
					d="M12.297 14.12c1.017.925 1.925 2 2.703 3.196a30.6 30.6 0 0 0-6 0 16.4 16.4 0 0 1 2.703-3.197A.44.44 0 0 1 12 14c.105 0 .21.04.297.12Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 6.832V3m0 3.832q-1.502 0-3-.148a16.4 16.4 0 0 0 2.703 3.197A.44.44 0 0 0 12 10a.44.44 0 0 0 .297-.12c1.017-.925 1.925-2 2.703-3.196q-1.498.147-3 .148Zm0 10.336V21m0-3.832q1.502 0 3 .148a16.4 16.4 0 0 0-2.703-3.197A.44.44 0 0 0 12 14a.44.44 0 0 0-.297.12A16.4 16.4 0 0 0 9 17.315a31 31 0 0 1 3-.148ZM5 12h14"
			/>
		</svg>
	)
}

export default IconAlignVerticalCenter1
