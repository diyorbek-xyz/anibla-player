import { useState } from 'react';
import style from './index.module.css'
import { cn } from './helpers';

interface Playlist {
	[key: string]: string | number | Playlist[];
}
function Playlist({ playlist, current, index = 'number', title = 'title', inner = 'inner' }: { playlist: Playlist[]; current: { [key: string]: number }; index?: string; title?: string; inner?: string }) {
	const currentSeason = playlist.find((season) => season[index] == current.season);
	const currentEpisode = (currentSeason?.[inner] as Playlist[]).find((episode) => episode[index] == current.episode);
	const [open, setOpen] = useState<boolean>(false);
	const isMobile = screen.width < 700 || navigator.userAgent.toLowerCase().includes('mobile');
	if (!currentEpisode) return;
	function renderInner(innerList: any[]) {
		const hasInner = (e: any) => (e[inner] as Playlist[])?.[0];
		return innerList?.map((e, i) =>
			hasInner(e) ? (
				<details key={i} className={style.lists}>
					<summary className={style.title}>
						{e[index]}. {e[title]}
					</summary>
					{renderInner(e[inner])}
				</details>
			) : (
				<div className={style.title} key={i}>
					{e[index]}. {e[title]}
				</div>
			)
		);
	}
	return (
		<div className={style.playlist}>
			<div className={cn(style.button, style.current)} onClick={() => setOpen(!open)}>
				{isMobile ? 'Playlist' : `${currentEpisode[index] as number}. ${currentEpisode[title] as string}`}
			</div>
			{open && <div className={style.menu}>{renderInner(playlist)}</div>}
		</div>
	);
}
