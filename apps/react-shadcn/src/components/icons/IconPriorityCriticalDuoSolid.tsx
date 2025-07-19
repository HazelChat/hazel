// icons/svgs/duo-solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconPriorityCriticalDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3c-.381 0-.79.081-1.157.274-2.107 1.103-4.03 2.362-5.727 3.758A3.02 3.02 0 0 0 4 9.37V20a1 1 0 0 0 1.662.75c1.749-1.545 3.8-2.94 6.108-4.149.04-.02.121-.045.23-.045s.19.025.23.045c2.307 1.208 4.36 2.604 6.108 4.148A1 1 0 0 0 20 20V9.369c0-.893-.398-1.746-1.116-2.337-1.698-1.396-3.62-2.655-5.727-3.758A2.5 2.5 0 0 0 12 3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.2 8.5c.126-.26.311-.498.55-.695 1.641-1.349 3.505-2.571 5.557-3.645.203-.107.448-.16.693-.16s.49.053.694.16c2.051 1.074 3.915 2.296 5.556 3.645.24.197.424.434.55.695"
			/>
		</svg>
	)
}

export default IconPriorityCriticalDuoSolid
