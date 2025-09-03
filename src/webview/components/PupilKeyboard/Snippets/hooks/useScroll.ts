import { useEffect, useRef, useState } from 'react'

const SCROLL_AMOUNT = 5
const SCROLL_INTERVAL = 10

type ScrollDirection = 'left' | 'right'

const useScroll = () => {
	const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [atStart, setAtStart] = useState<boolean>(true)
	const [atEnd, setAtEnd] = useState<boolean>(false)

	const checkScrollPosition = () => {
		const el = containerRef.current
		if (el) {
			setAtStart(el.scrollLeft === 0)
			setAtEnd(el.scrollLeft + el.offsetWidth >= el.scrollWidth - 1)
		}
	}

	useEffect(() => {
		const el = containerRef.current
		checkScrollPosition()

		el?.addEventListener('scroll', checkScrollPosition)
		return () => el?.removeEventListener('scroll', checkScrollPosition)
	}, [])

	const startScroll = (direction: ScrollDirection) => {
		if (scrollIntervalRef.current) {
			return
		}
		scrollIntervalRef.current = setInterval(() => {
			const el = containerRef.current
			if (el) {
				el.scrollBy({ left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT })
				checkScrollPosition()
			}
		}, SCROLL_INTERVAL)
	}

	const stopScroll = () => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current)
			scrollIntervalRef.current = null
		}
	}

	return { containerRef, atStart, atEnd, startScroll, stopScroll, checkScrollPosition }
}

export default useScroll
