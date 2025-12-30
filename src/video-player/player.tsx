import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { useVideoPlayer } from './hook';
import { CheckIcon, DownloadIcon, FullscreenExitIcon, FullscreenIcon, PauseIcon, PlayIcon, SettingIcon, SkipBackwardIcon, SkipForwardIcon, VolumeIcon, VolumeOffIcon } from './icons';
import style from './index.module.css';
import { cn, formatQuality, timeFormatter } from './helpers';
import type { Level } from 'hls.js';

/**
 * @params {string} src - Source link for video file. Example: video.m3u8 . Supported formats: hls - m3u8, normal - mp4
 * @params {string} poster - Source link for poster file that thumbnail of video. Example: poster.png
 * @params {string} preview - Source link for previews file for specific frames. Example: previews.vtt
 * @params {string} download - Source link for download file. Example: download.mp4
 * @example
 * import VideoPlayer from "video-player";
 *
 * <VideoPlayer src="video.m3u8" poster="poster.png" preview="previews.vtt" download="download.mp4">;
 */
function VideoPlayer({ src, poster, download }: { src: string; poster: string; download?: string }) {
	const { videoRef, state, actions } = useVideoPlayer(src);
	const [fullscreen, setFullscreen] = useState<boolean>(false);
	const [isResolutionMenuOpen, setIsResolutionMenuOpen] = useState<boolean>(false);
	const isMobile = screen.width < 700 || navigator.userAgent.toLowerCase().includes('mobile');
	useEffect(() => {
		window.addEventListener('keydown', keyboard);
		return () => {
			window.removeEventListener('keydown', keyboard);
		};
	}, [state]);
	async function toggleFullscreen() {
		const video_player = document.getElementById('xyz-player');

		if (document.fullscreenElement) {
			document
				.exitFullscreen()
				.then(() => setFullscreen(false))
				.catch((e) => alert(e));
		} else {
			video_player
				?.requestFullscreen()
				.then(async () => {
					setFullscreen(true);
					if ((screen.orientation as any)?.lock) {
						try {
							await (screen.orientation as any).lock('landscape');
						} catch {
							return;
						}
					}
				})
				.catch((e) => alert(e));
		}
	}
	function skip(step: number) {
		actions.skip(step);
		const video_player = document.getElementById('xyz-player');
		if (!video_player) return console.error('video-player not found');

		const skip_view = document.createElement('div');
		skip_view.classList.add(style.skip_view);
		if (step < 0) {
			skip_view.classList.add(style.left);
		} else {
			skip_view.classList.add(style.right);
			skip_view.innerText += '+';
		}

		skip_view.innerText += String(step);
		video_player.appendChild(skip_view);
		setTimeout(() => (skip_view.style.opacity = '1'), 50);
		setTimeout(() => (skip_view.style.opacity = '0'), 1700);
		setTimeout(() => video_player.removeChild(skip_view), 2200);
	}
	function keyboard(e: KeyboardEvent) {
		const allowed = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'f', 'm', ' '];
		if (!allowed.includes(e.key)) return;
		e.preventDefault();
		switch (e.key) {
			case 'ArrowRight':
				if (e.ctrlKey) skip(10);
				else skip(5);
				break;
			case 'ArrowLeft':
				if (e.ctrlKey) skip(-10);
				else skip(-5);
				break;
			case 'ArrowUp':
				actions.changeVolume(Math.min(state.volume + 0.1, 1));
				break;
			case 'ArrowDown':
				actions.changeVolume(Math.max(state.volume - 0.1, 0));
				break;
			case 'f':
				toggleFullscreen();
				break;
			case 'm':
				actions.toggleMuted();
				break;
			case ' ':
				actions.togglePlay();
				break;
			default:
				break;
		}
	}
	function handleClick(e: MouseEvent<HTMLVideoElement>) {
		if (e.currentTarget.clientWidth < 700 || navigator.userAgent.toLowerCase().includes('mobile')) {
			const root = document.getElementById('player-root');
			root!.hidden = !root!.hidden;
		} else {
			actions.togglePlay();
		}
	}
	return (
		<div id='xyz-player' className={style.video_player} data-mobile={isMobile}>
			<video poster={poster} onClick={handleClick} data-name='Video' ref={videoRef}>
				{/* <track label='previews' kind='metadata' srcLang='en' src={previews} default /> */}
			</video>
			<div id='player-root' className={style.root} hidden={false}>
				<div className={style.infos}>
					<h3 className={style.title}>Blender Coorporation. Example animation</h3>
				</div>
				<div className={style.overlay}>
					{isMobile && (
						<div onClick={() => actions.skip(-5)} className={cn(style.button, style.skip, style.backward)}>
							<SkipBackwardIcon />
						</div>
					)}
					<div onClick={() => actions.togglePlay()} className={cn(style.button, style.paused)} data-paused={!state.playing}>
						{state.playing ? <PauseIcon /> : <PlayIcon />}
					</div>
					{isMobile && (
						<div onClick={() => actions.skip(5)} className={cn(style.button, style.skip, style.forward)}>
							<SkipForwardIcon />
						</div>
					)}
					<div className={style.buffering} hidden={!state.buffering}></div>
					<div className={style.barrier}>
						<div></div>
						<div></div>
					</div>
				</div>
				<div className={style.controls}>
					<TimeSlider playing={state.playing} play={actions.play} pause={actions.pause} buffers={state.buffers} duration={state.duration} currentTime={state.currentTime} changeTime={(currentTime: number) => actions.seek(currentTime)} />
					<RenditionMenu levels={state.levels} level={state.currentLevel} changeLevel={actions.changeLevel} isOpen={isResolutionMenuOpen} setIsOpen={setIsResolutionMenuOpen} />
					<div className={style.main}>
						<div className={cn(style.button, style.play)} data-tooltip='Play/Pause [Space]' data-name='TogglePlayingButton' onClick={() => actions.togglePlay()}>
							{state.playing ? <PauseIcon /> : <PlayIcon />}
						</div>
						<VolumeSlider changeVolume={actions.changeVolume} toggleMute={actions.toggleMuted} volume={state.volume} muted={state.muted} />
						<div className={style.time_display} data-tooltip='Time Display' data-name='TimeDisplay'>
							{timeFormatter(state.currentTime)} / {timeFormatter(state.duration)}
						</div>
					</div>
					<div className={style.others}>
						<a className={cn(style.button, style.download)} data-tooltip='Download' data-name='DownloadButton' href={download ?? src} download='1-qism'>
							<DownloadIcon />
						</a>
						{state.levels[0] && (
							<button className={cn(style.button, style.resolution_trigger)} data-tooltip='Open Resolution Menu' data-name='ResolutionButton' onClick={() => setIsResolutionMenuOpen(!isResolutionMenuOpen)}>
								<SettingIcon />
								<span className={style.badge}>{formatQuality(state.levels[state.currentLevel]?.height, 'name')}</span>
							</button>
						)}
						<div className={style.button} data-tooltip='Fullscreen [f]' data-name='FullscreenButton' onClick={toggleFullscreen}>
							{fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
function RenditionMenu({ isOpen, setIsOpen, levels, level, changeLevel }: { levels: Level[]; isOpen: boolean; setIsOpen: any; level: number; changeLevel: (level: number) => void }) {
	function changeResolution(e: MouseEvent<HTMLButtonElement>) {
		if (levels?.[0]) {
			changeLevel(Number(e.currentTarget.dataset.value));
			setIsOpen(false);
		}
	}
	if (!isOpen) return;
	return (
		<>
			<div className={style.menu} data-name='ResolutionMenu'>
				<div className={style.title}>
					<h3>Sifatni Tanlang</h3>
				</div>
				<div className={style.levels}>
					<button className={style.level} onClick={changeResolution} title='auto' data-value={-1}>
						Auto
						{-1 === level && <CheckIcon />}
					</button>
					{levels.map((l, i) => (
						<button className={style.level} onClick={changeResolution} title={l.width.toString()} data-value={i} key={i}>
							{formatQuality(l.width)}
							{i === level && <CheckIcon />}
						</button>
					))}
				</div>
			</div>
			<div className={style.close} onClick={() => setIsOpen(false)} />
		</>
	);
}
function TimeSlider({ changeTime, currentTime, duration, buffers, pause, play, playing }: { changeTime: (props: number) => void; pause: () => void; play: () => void; playing: boolean; previews?: string; duration: number; currentTime: number; buffers?: any }) {
	const timebarRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const [timePreview, setTimePreview] = useState<{ time: string; image?: string; position?: number }>({ time: '', position: 0 });
	const [enabled, setEnabled] = useState<boolean>(false);
	const isMobile = screen.width < 700 || navigator.userAgent.toLowerCase().includes('mobile');

	const clickTime = (clientX: number) => {
		if (!timebarRef.current) return;
		const rect = timebarRef.current.getBoundingClientRect();
		const newTime = Math.min(Math.max(((clientX - rect.left) / rect.width) * duration, 0), duration);
		changeTime(newTime);
	};
	const dragTime = (clientX: number, change: boolean) => {
		pause();
		const rect = timebarRef.current!.getBoundingClientRect();
		const timeAtCursor = ((clientX - rect.left) / rect.width) * duration;

		timebarRef.current!.dataset.hover = true as any;
		if (timeAtCursor >= duration) return;
		if (timebarRef.current) {
			const hover = timebarRef.current.getElementsByClassName(style.hover)?.item(0) as HTMLElement;
			if (hover) hover.style.width = Math.max(Math.min((timeAtCursor * 100) / duration, duration), 0) + '%';
		}
		if (previewRef.current) {
			const preview_width = previewRef.current.getBoundingClientRect().width;
			const position = Math.max(Math.min(clientX - 25 - preview_width / 2, rect.width - rect.left - preview_width), rect.left);
			setTimePreview({ position: position, time: timeFormatter(Math.min(Math.max(timeAtCursor, 0), duration)), image: undefined });
		} else {
			setTimePreview({ time: timeFormatter(Math.min(Math.max(timeAtCursor, 0), duration)), image: undefined });
		}
		setEnabled(true);
		if (change) clickTime(clientX);
	};
	const handleTimeTouch = (e: TouchEvent<HTMLDivElement>) => dragTime(e.touches[0].clientX, true);
	const handleTimeMove = (e: any) => dragTime(e.clientX, e.buttons === 1);
	const exitTimePreview = () => (setEnabled(false), playing && play(), (timebarRef.current!.dataset.hover = false as any));

	return (
		<>
			<div
				ref={timebarRef}
				className={style.time_bar}
				data-tooltip='Skip 5 [ArrowLeft/ArowRight]'
				data-name='TimeSlider'
				onClick={(e) => clickTime(e.clientX)}
				onTouchEnd={isMobile ? exitTimePreview : undefined}
				onTouchCancel={isMobile ? exitTimePreview : undefined}
				onTouchMove={isMobile ? handleTimeTouch : undefined}
				onMouseMove={!isMobile ? handleTimeMove : undefined}
				onMouseOut={!isMobile ? exitTimePreview : undefined}
				onMouseLeave={!isMobile ? exitTimePreview : undefined}
				onMouseUp={!isMobile ? exitTimePreview : undefined}>
				<div className={style.range}>
					<div className={style.fill} style={{ width: `${(currentTime * 100) / duration}%` }}>
						<div className={style.thumb} />
					</div>
					{!isMobile && <div className={style.hover} />}
					{buffers && (
						<div className={style.buffers}>
							{buffers?.[0] ? (
								buffers?.map(({ start, end }: any, i: number) => <div key={i} className={style.buffered} style={{ width: `${((end - start) * 100) / duration}%`, left: `${(start * 100) / duration}%` }} />)
							) : (
								<div className={style.buffered} style={{ width: `${((buffers.end - buffers.start) * 100) / duration}%`, left: `${(buffers.start * 100) / duration}%` }} />
							)}
						</div>
					)}
				</div>
				{!isMobile && (
					<div ref={previewRef} className={style.preview_root} style={{ left: timePreview.position }}>
						<div hidden={!enabled} className={style.preview} data-image={!timePreview.image}>
							{timePreview.image && <img className={style.preview_image} src='/poster.png' />}
							<h1 className={style.preview_time}>{timePreview.time}</h1>
						</div>
					</div>
				)}
			</div>
			{isMobile && (
				<div hidden={!enabled} className={style.mobile_preview}>
					{timePreview.image && <img className={style.image} src={timePreview.image} />}
					<h1 className={style.time}>{timePreview.time}</h1>
				</div>
			)}
		</>
	);
}
function VolumeSlider({ toggleMute, changeVolume, muted, volume }: { toggleMute: () => void; changeVolume: (volume: number) => void; muted: boolean; volume: number }) {
	const barRef = useRef<HTMLDivElement>(null);
	function slide(x: number) {
		if (!barRef.current) return;
		const rect = barRef.current.getBoundingClientRect();
		changeVolume(Math.min(Math.max(Number(((x - rect.left) / rect.width).toFixed(1)), 0), 1));
	}
	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		if (e.buttons === 1) slide(e.clientX);
	}
	function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
		e.currentTarget.removeEventListener('mousemove', (e) => handleMouseMove(e as any));
		slide(e.touches[0].clientX);
	}
	return (
		<div className={style.volume} data-name='VolumeControl'>
			<div onClick={() => toggleMute()} className={style.mute} data-tooltip='Mute [m]' data-name='MuteButton'>
				{muted || volume === 0 ? <VolumeOffIcon /> : <VolumeIcon />}
			</div>
			<div ref={barRef} className={style.range} onClick={(e) => slide(e.clientX)} data-tooltip='Volume [ArowDown/ArrowUp]' data-name='VolumeSlider' onTouchMove={handleTouchMove} onMouseMove={handleMouseMove}>
				<div className={style.track} />
				<div className={style.fill} style={{ width: `${volume * 100}%` }} />
				<div className={style.thumb} style={{ left: `${volume * 100}%` }} />
			</div>
		</div>
	);
}
export default VideoPlayer;
