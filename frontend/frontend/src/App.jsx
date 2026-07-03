import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [sounds, setSounds] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [audio, setAudio] = useState(null);

  const [playing, setPlaying] = useState({});
  const [currentTime, setCurrentTime] = useState({});
  const [duration, setDuration] = useState({});

  const audioRefs = useRef({});

  useEffect(() => {
    fetchSounds();
  }, []);

  // Fetch sounds
  const fetchSounds = async () => {
    try {
      const res = await axios.get("https://dj-n1at.onrender.com/api/sounds");
      setSounds(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Upload sound
  const uploadSound = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("audio", audio);

    try {
      await axios.post("https://dj-n1at.onrender.com/api/sounds", formData);

      setTitle("");
      setCategory("");
      setAudio(null);

      fetchSounds();
    } catch (err) {
      console.log(err);
    }
  };

  // Delete sound
  const deleteSound = async (id) => {
    try {
      await axios.delete(`https://dj-n1at.onrender.com/api/sounds/${id}`);

      setSounds((prev) =>
        prev.filter((sound) => sound._id !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  // Play / Pause
  const togglePlay = (id) => {
    const audio = audioRefs.current[id];

    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setPlaying((prev) => ({
        ...prev,
        [id]: true,
      }));
    } else {
      audio.pause();
      setPlaying((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  // Update progress
  const updateProgress = (id) => {
    const audio = audioRefs.current[id];

    setCurrentTime((prev) => ({
      ...prev,
      [id]: audio.currentTime,
    }));
  };

  // Update duration
  const updateDuration = (id) => {
    const audio = audioRefs.current[id];

    setDuration((prev) => ({
      ...prev,
      [id]: audio.duration,
    }));
  };

  // Seek audio
  const seekAudio = (id, value) => {
    audioRefs.current[id].currentTime = value;
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="container">
      <h1>DJ Soundboard</h1>

      {/* Upload Form */}
      <form onSubmit={uploadSound}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files[0])}
          required
        />

        <button type="submit">Upload</button>
      </form>

      {/* Sound Cards */}
      <div className="sound-list">
        {sounds.map((sound) => (
          <div className="card" key={sound._id}>
            <audio
              ref={(el) => (audioRefs.current[sound._id] = el)}
              onTimeUpdate={() => updateProgress(sound._id)}
              onLoadedMetadata={() => updateDuration(sound._id)}
              onEnded={() =>
                setPlaying((prev) => ({
                  ...prev,
                  [sound._id]: false,
                }))
              }
            >
              <source src={sound.audioUrl} />
            </audio>

            {/* Play Button */}
            <button
              className="play-btn"
              onClick={() => togglePlay(sound._id)}
            >
              {playing[sound._id] ? "⏸" : "▶"}
            </button>

            <h3>{sound.title}</h3>

            {/* Time */}
            <div className="time">
              {formatTime(currentTime[sound._id])}
              {" / "}
              {formatTime(duration[sound._id])}
            </div>

            {/* Timeline */}
            <input
              className="progress-bar"
              type="range"
              min="0"
              max={duration[sound._id] || 0}
              value={currentTime[sound._id] || 0}
              onChange={(e) =>
                seekAudio(sound._id, e.target.value)
              }
            />

            {/* Delete Button */}
            <button
              className="delete-btn"
              onClick={() => deleteSound(sound._id)}
            >
              🗑 Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;