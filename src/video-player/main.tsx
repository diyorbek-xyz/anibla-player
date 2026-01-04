import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import VideoPlayer from './player';
import './main.css';

const root: HTMLElement | null = document.getElementById('root');
if (root) {
	createRoot(root).render(
		<StrictMode>
			<div>
				<VideoPlayer custom={[{ child: 'DD', isButton: true, onClick: null as any, className: '' }]} src='/video.mp4' poster='/poster.png' />
			</div>
		</StrictMode>
	);
}
