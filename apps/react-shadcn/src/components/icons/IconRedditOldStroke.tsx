// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconRedditOldStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m11.999 7.645 1.529-3.901a1.5 1.5 0 0 1 1.647-.885l3.49.634M12 7.645c-2.58 0-4.907.845-6.549 2.198M12 7.645c2.582 0 4.91.845 6.55 2.2m-2.96 7.198c-.717.682-2.058 1.14-3.593 1.14s-2.875-.458-3.592-1.14m7.095-3.898h.01m-7.01 0h.01m10.156-9.652q-.023.126-.024.26a1.399 1.399 0 1 0 .024-.26ZM5.451 9.843a2.167 2.167 0 1 0-2.011 2.632m2.01-2.632c-.9.743-1.594 1.638-2.01 2.632m0 0a5.6 5.6 0 0 0-.441 2.17c0 3.866 4.03 7 9 7s9-3.134 9-7c0-.758-.155-1.487-.441-2.17m-2.009-2.63a2.167 2.167 0 1 1 2.009 2.63m-2.009-2.63c.9.742 1.593 1.637 2.009 2.63m-11.559.67a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm7 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconRedditOldStroke
