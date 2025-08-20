const prompt_data = {
  "carla-004":
    "a street-level driving scene in a modern city, featuring cars, traffic signs and buildings, photorealistic, high-fidelity",
  "carla-010":
    "a street-level driving scene in a modern city, featuring cars, traffic signs and buildings, photorealistic, high-fidelity",
  "carla-large_building":
    "A driving scene, city and buildings, photorealistic, high-fidelity",
  "carla-turn":
    "A driving scene, city and buildings, photorealistic, high-fidelity",
  bear: "<Style Transfer> To sketch",
  blackswan: "<Style Transfer> To comic",
  breakdance: "<Style Transfer> To ukiyo-e(浮世繪)",
  bus: "<Style Transfer> To pixel art",
  camel: "<Style Transfer> To charcoal(墨)",
  "car-shadow": "<Style Transfer> To comic",
  "car-turn": "a bronze-colored(棕色) SUV with glowing wheels",
  dog: "a dalmatian(麥町狗) sniffing the ground in the yard",
  flamingo: "flamingos made of origami(摺紙) in a paper pond",
  "gold-fish": "a group of koi(錦鯉) fish swimming in the aquarium(水族館)",
  hike: "<Style Transfer> To charcoal(墨)",
  libby: "<Style Transfer> To watercolor(水彩)",
  "mallard-water": "a golden duck shimmering under sunlight",
  walking:
    "a man and woman in traditional kimono(和服) on a neon-lit(霓虹燈) street",
};

const question_data = [
  "carla-004",
  "carla-010",
  "carla-large_building",
  "carla-turn",
  "bear",
  "blackswan",
  "breakdance",
  "bus",
  "camel",
  "car-shadow",
  "car-turn",
  "dog",
  "flamingo",
  "gold-fish",
  "hike",
  "libby",
  "mallard-water",
  "walking",
];

let currentQuestionIndex = 0;
let totalQuestions = question_data.length;
let responses = {};

// 初始化
window.onload = function () {
  InitZoomInBtn();
  initVideoControl();
  loadQuestionData(currentQuestionIndex);
  updateProgress();
};

function populateDatasetSelector() {
  const select = document.getElementById("dataSelect");

  question_data.forEach((dataset) => {
    const option = document.createElement("option");
    option.value = dataset;
    option.textContent = dataset;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    if (this.value) {
      loadDataset(this.value);
    }
  });
}

function loadQuestionData(index) {
  const datasetName = question_data[index];
  // 更新影片路徑
  const basePath = `./${datasetName}/`;
  document.getElementById("sourceVideo").src = basePath + "source.mp4";
  document.getElementById("video1").src = basePath + "vidtome.mp4";
  document.getElementById("video2").src = basePath + "rave.mp4";
  document.getElementById("video3").src = basePath + "our.mp4";
  document.getElementById("video4").src = basePath + "fresco.mp4";

  document.getElementById("promptText").innerText =
    prompt_data[datasetName] ?? "prompt-no-set";

  // 檢查並載入風格參考圖片
  checkStyleReference(basePath);

  // 重新載入所有影片
  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    video.load();
  });

  // 設置初始播放速度
  document.querySelectorAll("video").forEach((video) => {
    video.playbackRate = 0.25;
  });
  document.getElementById("speed025").checked = true;
}

function checkStyleReference(basePath) {
  const styleImg = document.getElementById("styleReference");
  const noStyleDiv = document.getElementById("noStyleRef");

  // 嘗試載入風格參考圖片
  const img = new Image();
  img.onload = function () {
    styleImg.src = this.src;
    styleImg.style.display = "block";
    noStyleDiv.style.display = "none";
  };
  img.onerror = function () {
    styleImg.style.display = "none";
    noStyleDiv.style.display = "block";
  };
  // 您可能需要根據實際的檔案命名規則來調整這裡
  img.src = basePath + "_style_ref.png";
}

// 播放速度控制
document.querySelectorAll('input[name="playbackSpeed"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    const speed = parseFloat(this.value);
    document.querySelectorAll("video").forEach((video) => {
      video.playbackRate = speed;
    });
  });
});

function nextQuestion() {
  // 保存當前問題的回答
  saveCurrentResponses();

  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    updateProgress();
    updateNavigation();

    // 這裡您可以載入下一題的資料
    loadQuestionData(currentQuestionIndex);
    loadResponses(currentQuestionIndex);
  } else {
    // 完成問卷
    alert("問卷已完成！感謝您的參與。");
    console.log("所有回答：", responses);
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    updateProgress();
    updateNavigation();

    // 載入上一題的資料
    loadQuestionData(currentQuestionIndex);
    loadResponses(currentQuestionIndex);
  }
}

function saveCurrentResponses() {
  const questionKey = `question_${currentQuestionIndex}`;
  responses[questionKey] = {
    q1_first: document.querySelector('input[name="q1_first"]:checked')?.value,
    q1_second: document.querySelector('input[name="q1_second"]:checked')?.value,
    q2_first: document.querySelector('input[name="q2_first"]:checked')?.value,
    q2_second: document.querySelector('input[name="q2_second"]:checked')?.value,
    q3_first: document.querySelector('input[name="q3_first"]:checked')?.value,
    q3_second: document.querySelector('input[name="q3_second"]:checked')?.value,
  };
}

function loadResponses(questionIndex) {
  const questionKey = `question_${questionIndex}`;
  const saved = responses[questionKey];

  for (const name of [
    "q1_first",
    "q1_second",
    "q2_first",
    "q2_second",
    "q3_first",
    "q3_second",
  ]) {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    const value = saved?.[name];
    if (value === undefined) {
      // 取消選中
      radios.forEach((radio) => (radio.checked = false));
    } else {
      // 選中對應的 radio
      const radio = document.querySelector(
        `input[name="${name}"][value="${value}"]`
      );
      if (radio) radio.checked = true;
    }
  }
}

function updateProgress() {
  const progressFill = document.getElementById("progressFill");
  const currentQ = document.getElementById("currentQuestion");
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  progressFill.style.width = progress + "%";
  currentQ.textContent = currentQuestionIndex + 1;

  document.getElementById("totalQuestions").innerText = question_data.length;
}

function updateNavigation() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.disabled = currentQuestionIndex === 0;

  if (currentQuestionIndex === totalQuestions - 1) {
    nextBtn.textContent = "完成問卷";
  } else {
    nextBtn.textContent = "下一題";
  }
}

// 防止選擇相同選項
function setupRadioValidation() {
  const questions = ["q1", "q2", "q3"];

  questions.forEach((q) => {
    const firstRadios = document.querySelectorAll(`input[name="${q}_first"]`);
    const secondRadios = document.querySelectorAll(`input[name="${q}_second"]`);

    firstRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        if (this.checked) {
          const sameValueSecond = document.querySelector(
            `input[name="${q}_second"][value="${this.value}"]`
          );
          if (sameValueSecond && sameValueSecond.checked) {
            sameValueSecond.checked = false;
          }
        }
      });
    });

    secondRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        if (this.checked) {
          const sameValueFirst = document.querySelector(
            `input[name="${q}_first"][value="${this.value}"]`
          );
          if (sameValueFirst && sameValueFirst.checked) {
            sameValueFirst.checked = false;
          }
        }
      });
    });
  });
}

function initVideoControl() {
  const sourceVideo = document.getElementById("sourceVideo");
  const videos = [
    document.getElementById("video1"),
    document.getElementById("video2"),
    document.getElementById("video3"),
    document.getElementById("video4"),
  ];
  videos.forEach((v) => {
    v.controls = false; // 隱藏控制列
    v.addEventListener("mousedown", (e) => e.preventDefault()); // 阻止滑鼠操作
  });
  // 讓影片跟隨 sourceVideo 播放進度
  sourceVideo.addEventListener("timeupdate", () => {
    const currentTime = sourceVideo.currentTime;
    videos.forEach((v) => {
      if (Math.abs(v.currentTime - currentTime) > 0.025) {
        // 避免頻繁重設
        v.currentTime = currentTime;
      }
    });
  });

  // 可選：當 sourceVideo 播放或暫停時，同步其他影片
  sourceVideo.addEventListener("play", () => videos.forEach((v) => v.play()));
  sourceVideo.addEventListener("pause", () => videos.forEach((v) => v.pause()));
}

function InitZoomInBtn() {
  const zoomBtn = document.getElementById("zoomBtn");
  const videoContainer = document.getElementById("video-container");

  zoomBtn.addEventListener("click", () => {
    videoContainer.classList.toggle("zoomed"); // 切換放大/縮小
  });
}

// 初始化驗證
setupRadioValidation();
