function fromStream(stream, canvas_id, options = {}, connectDestination=true, audioContext=null) {

    this.current_stream.id = canvas_id;
    this.current_stream.options = options;

    let audioCtx, analyser, source;
    if (!this.sources[stream.toString()]) {
        if(audioContext)
            audioCtx = audioContext
        else
            audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();

        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        if (connectDestination) {
            source.connect(audioCtx.destination); //playback audio
        }
        
        this.sources[stream.toString()] = {
            "audioCtx": audioCtx,
            "analyser": analyser,
            "source": source
        }
    } else {
        cancelAnimationFrame(this.sources[stream.toString()].animation);
        audioCtx = this.sources[stream.toString()].audioCtx;
        analyser = this.sources[stream.toString()].analyser;
        source = this.sources[stream.toString()].source;
    }

    analyser.fftsize = 32768;
    let bufferLength = analyser.frequencyBinCount;
    this.current_stream.data = new Uint8Array(bufferLength);

    let self = this;
    let frameCount = 1

    function renderFrame() {
        self.current_stream.animation = requestAnimationFrame(self.current_stream.loop);
        frameCount++;
        self.sources[stream.toString()].animation = self.current_stream.animation;
        analyser.getByteFrequencyData(self.current_stream.data);

        self.visualize(self.current_stream.data, self.current_stream.id, self.current_stream.options, frameCount);
    }

    this.current_stream.loop = renderFrame;
    renderFrame();

}

function stopStream() {
    cancelAnimationFrame(this.current_stream.animation);
}

function playStream() {
    this.current_stream.loop();
}

export default {
    fromStream,
    stopStream,
    playStream
}