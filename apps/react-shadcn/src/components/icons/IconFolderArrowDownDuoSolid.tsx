// icons/svgs/duo-solid/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFolderArrowDownDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.924 2.108C9.564 1.998 9.184 2 8.806 2h-.449C7.273 2 6.4 2 5.691 2.058c-.728.06-1.369.185-1.961.487A5 5 0 0 0 1.545 4.73c-.302.593-.428 1.233-.487 1.962C1 7.399 1 8.274 1 9.357v5.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C6.4 22 7.273 22 8.357 22h7.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C23 16.6 23 15.727 23 14.643v-2.286c0-1.083 0-1.958-.058-2.665-.06-.73-.185-1.37-.487-1.962a5 5 0 0 0-2.185-2.185c-.592-.302-1.232-.427-1.961-.487C17.6 5 16.727 5 15.643 5h-2.359c-.531 0-.589-.01-.626-.021a.5.5 0 0 1-.173-.093c-.03-.024-.07-.067-.365-.51l-.575-.862-.05-.075c-.21-.314-.42-.631-.71-.87a2.5 2.5 0 0 0-.861-.46Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 11v6m0 0a.47.47 0 0 1-.296-.105A10 10 0 0 1 10 15.125M12 17c.105 0 .21-.035.296-.105A10 10 0 0 0 14 15.125"
			/>
		</svg>
	)
}

export default IconFolderArrowDownDuoSolid
