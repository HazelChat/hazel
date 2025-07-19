// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconFuelerStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 2.104c.993 0 1.72 1.593 2.616 1.883.928.3 2.455-.553 3.228.007.78.565.435 2.278 1.003 3.055.562.77 2.309.968 2.61 1.892.29.892-.995 2.071-.995 3.06 0 .987 1.286 2.166.995 3.058-.301.924-2.048 1.123-2.61 1.892-.568.777-.223 2.49-1.003 3.055-.773.56-2.3-.293-3.228.008-.896.29-1.623 1.882-2.616 1.882s-1.72-1.593-2.616-1.883c-.928-.3-2.455.553-3.228-.007-.78-.565-.435-2.278-1.003-3.055-.562-.77-2.309-.968-2.61-1.892-.29-.892.995-2.07.995-3.059 0-.988-1.286-2.167-.995-3.059.301-.924 2.048-1.123 2.61-1.892.568-.777.223-2.49 1.003-3.055.773-.56 2.3.293 3.228-.007.896-.29 1.623-1.883 2.616-1.883Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9.215 12.476 2.678-5.087c.177-.338.684-.21.683.172v3.104a.36.36 0 0 0 .363.367l1.526.001a.368.368 0 0 1 .316.547l-2.795 5.039c-.183.33-.68.198-.68-.18v-3.056a.365.365 0 0 0-.363-.367H9.534a.368.368 0 0 1-.32-.54Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFuelerStroke
