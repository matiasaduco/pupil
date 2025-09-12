import { useEffect, useState } from 'react'

const usePupilDialog = () => {
	const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(
		typeof window !== 'undefined' ? document.getElementById('pupil-dialog-portal') : null
	)

	useEffect(() => {
		if (portalTarget || typeof window === 'undefined') {
			return
		}

		const observer = new MutationObserver(() => {
			const portal = document.getElementById('pupil-dialog-portal')
			if (portal) {
				setPortalTarget(portal)
				observer.disconnect()
			}
		})

		observer.observe(document.body, { childList: true, subtree: true })
		return () => observer.disconnect()
	}, [portalTarget])

	return { portalTarget }
}

export default usePupilDialog
