console.log("lets write java now");

let audio = new Audio(); // Reuse this audio object
let songs = [];
let currfolder;

async function getSongs(folder) {
    currfolder = folder;
    songs = []; // 🔥 Clear previous songs

    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // 🔥 Show songs in UI
    let songUL = document.querySelector(".songs ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `<li>
            <div class="adjust flex">
                <img class="invert" width="34" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Harry</div>
                </div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        </li>`;
    }

    // 🔥 Attach click event to all new songs
    Array.from(document.querySelector(".songs ul").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log("Clicked song:", songName);
            playmusic(songName);
        });
    });

    return songs;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function playmusic(track) {
    audio.src = `${currfolder}${track}`;
    audio.play();
    play.src = "pause.svg";
    songName.innerHTML = track.replaceAll("%20", " ");
}

async function displayalbum() {
    let a = await fetch(`/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let cardsHTML = "";

    for (const e of div.getElementsByTagName("a")) {
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            try {
                let res = await fetch(`/songs/${folder}/info.json`);
                let meta = await res.json();
                cardsHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>`;
            } catch (err) {
                console.warn(`Could not load metadata for folder: ${folder}`);
            }
        }
    }

    document.querySelector(".cards").innerHTML = cardsHTML;

    // 🔥 Attach event to each album card
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            console.log("Album Clicked:", card.dataset.folder);
            songs = await getSongs(`songs/${card.dataset.folder}/`);
            if (songs.length > 0) playmusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/ncs/");
    await displayalbum();

    play.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            play.src = "pause.svg";
        } else {
            audio.pause();
            play.src = "play.svg";
        }
    });

    audio.addEventListener("timeupdate", () => {
        songTime.innerHTML = `${secondsToMinutesSeconds(audio.currentTime)}:${secondsToMinutesSeconds(audio.duration)}`;
        document.querySelector(".circle").style.left = (audio.currentTime / audio.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        audio.currentTime = (audio.duration * percent) / 100;
        document.querySelector(".circle").style.left = percent + "%";
    });

    document.querySelector(".hamer").addEventListener("click", () => {
        document.querySelector(".left-con").style.left = "0%";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left-con").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        audio.pause();
        let index = songs.indexOf(audio.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        audio.pause();
        let index = songs.indexOf(audio.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
    });
}

main();
