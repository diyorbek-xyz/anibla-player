import * as react from 'react';
import { Level, BufferTimeRange } from 'hls.js';

type PlayerState = {
    playing: boolean;
    volume: number;
    muted: boolean;
    duration: number;
    currentTime: number;
    levels: Level[];
    currentLevel: number;
    buffering: boolean;
    buffers: BufferTimeRange[] | TimeRanges;
};
declare function useVideoPlayer(url: string, type?: string): {
    videoRef: react.RefObject<HTMLVideoElement>;
    state: {
        playing: boolean;
        volume: number;
        muted: boolean;
        duration: number;
        currentTime: number;
        levels: Level[];
        currentLevel: number;
        buffering: boolean;
        buffers: BufferTimeRange[] | TimeRanges;
    };
    actions: {
        togglePlay: () => void;
        pause: () => void;
        play: () => void;
        seek: (time: number) => void;
        changeLevel: (level: number) => void;
        dispatch: react.ActionDispatch<[a: Partial<PlayerState>]>;
        toggleMuted: () => void;
        changeVolume: (volume: number) => void;
        skip: (step: number) => void;
    };
};

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
declare function VideoPlayer({ src, poster, download }: {
    src: string;
    poster: string;
    download?: string;
}): react.JSX.Element;

export { VideoPlayer, useVideoPlayer };
