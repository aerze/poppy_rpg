class AudioManager {
    static audioFiles = {
        confirm: "audio/confirm.ogg",
        cancel: "audio/cancel.ogg"
    }

    static defaultVolume = 0.5;

    constructor() {
        /** @type {Map<string, HTMLAudioElement} */
        this.audioMap = new Map();

        for (const key in AudioManager.audioFiles) {
            if (Object.hasOwnProperty.call(AudioManager.audioFiles, key)) {
                const path = AudioManager.audioFiles[key];
                const audioEl = document.createElement('audio');
                audioEl.src = path;
                audioEl.volume = AudioManager.defaultVolume;
                document.body.appendChild(audioEl);
                this.audioMap.set(key, audioEl);
            }
        }    
    }

    play(key) {
        const audioEl = this.audioMap.get(key);
        if (!audioEl) return;

        audioEl.currentTime = 0;
        audioEl.play();
    }
}

export default new AudioManager();