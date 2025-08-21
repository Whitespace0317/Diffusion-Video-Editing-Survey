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

const methodsMap = {
  0: "fresco",
  1: "rave",
  2: "vidtome",
  3: "our",
};

const Video2ID = {
  video1: 0,
  video2: 1,
  video3: 2,
  video4: 3,
};

let totalQuestions = question_data.length;
let currentQuestionIndex = undefined;
let question_order = undefined;
let responses = undefined;

function initUserInfo() {
  currentQuestionIndex = getQuestionIndex();
  question_order = getQuestionOrder();
  responses = getResponses();
}
// 初始化
window.onload = function () {
  initUserInfo();
  initVideoControl();
  loadQuestionData(currentQuestionIndex);
  updateProgress();
  updateNavigation();
};

async function testing_end() {
  const responseData = reorderUserResponses();
  const { data, error } = await supabase
    .from("user_reply") // 你的資料表名稱
    .insert([responseData]);

  if (error) {
    alert("問卷出現錯誤，請通知我們進行修復!!");
    console.error("上傳失敗:", error);
    return false;
  } else {
    localStorage.clear();
    initUserInfo();
    loadQuestionData(0);
    openModal();
    alert("問卷已完成！感謝您的參與。");
    console.log("上傳成功:", data);
    return true;
  }
}

function reorderUserResponses() {
  const responseData = {};

  Object.entries(responses).forEach(([qKey, qValue], index) => {
    const qNum = String(index + 1).padStart(2, "0"); // 01, 02, ...
    responseData[`q${qNum}_tc_1`] =
      methodsMap[question_order[index][Video2ID[qValue.tc_first]]];
    responseData[`q${qNum}_tc_2`] =
      methodsMap[question_order[index][Video2ID[qValue.tc_second]]];
    responseData[`q${qNum}_ta_1`] =
      methodsMap[question_order[index][Video2ID[qValue.ta_first]]];
    responseData[`q${qNum}_ta_2`] =
      methodsMap[question_order[index][Video2ID[qValue.ta_second]]];
    responseData[`q${qNum}_ge_1`] =
      methodsMap[question_order[index][Video2ID[qValue.ge_first]]];
    responseData[`q${qNum}_ge_2`] =
      methodsMap[question_order[index][Video2ID[qValue.ge_second]]];
  });

  console.log(responseData);
  return responseData;
}

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
  currentQuestionIndex = index;
  localStorage.setItem("questionIndex", JSON.stringify(currentQuestionIndex));
  updateProgress();
  updateNavigation();
  loadResponses(index);

  const datasetName = question_data[index];
  // 更新影片路徑
  const basePath = `./${datasetName}/`;
  document.getElementById("sourceVideo").src = basePath + "source.mp4";
  document.getElementById("video1").src =
    basePath + methodsMap[question_order[index][0]] + ".mp4";
  document.getElementById("video2").src =
    basePath + methodsMap[question_order[index][1]] + ".mp4";
  document.getElementById("video3").src =
    basePath + methodsMap[question_order[index][2]] + ".mp4";
  document.getElementById("video4").src =
    basePath + methodsMap[question_order[index][3]] + ".mp4";

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
  document
    .getElementById("video-container")
    .querySelectorAll("video")
    .forEach((video) => {
      video.playbackRate = 0.25;
    });
  document.getElementById("speed025").checked = true;

  //回到頁面上方
  window.scrollTo({
    top: 0,
    behavior: "smooth", // 平滑滾動
  });
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
  img.src = basePath + "style_ref.png";
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
  // 確認所有問題皆以回答
  if (validateChoices()) {
    // 保存當前問題的回答
    saveCurrentResponses();

    if (currentQuestionIndex < totalQuestions - 1) {
      currentQuestionIndex++;

      // 這裡您可以載入下一題的資料
      loadQuestionData(currentQuestionIndex);
    } else {
      // 完成問卷
      testing_end();
    }
  }
}

function previousQuestion() {
  // 保存當前問題的回答
  saveCurrentResponses();
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;

    // 載入上一題的資料
    loadQuestionData(currentQuestionIndex);
  }
}

function getQuestionIndex() {
  return JSON.parse(localStorage.getItem("questionIndex")) ?? 0;
}

function getResponses() {
  const responses = JSON.parse(localStorage.getItem("responses")) ?? {};
  //沒有受試者記錄開啟教學頁面
  if (Object.keys(responses).length == 0) openModal();
  return responses;
}

function saveCurrentResponses() {
  const questionKey = `question_${currentQuestionIndex}`;
  responses[questionKey] = {
    tc_first: document.querySelector('input[name="tc_first"]:checked')?.value,
    tc_second: document.querySelector('input[name="tc_second"]:checked')?.value,
    ta_first: document.querySelector('input[name="ta_first"]:checked')?.value,
    ta_second: document.querySelector('input[name="ta_second"]:checked')?.value,
    ge_first: document.querySelector('input[name="ge_first"]:checked')?.value,
    ge_second: document.querySelector('input[name="ge_second"]:checked')?.value,
  };
  localStorage.setItem("responses", JSON.stringify(responses));
  console.log(currentQuestionIndex, responses[questionKey]);
}

function loadResponses(questionIndex) {
  const questionKey = `question_${questionIndex}`;
  const saved = responses[questionKey];

  for (const name of [
    "tc_first",
    "tc_second",
    "ta_first",
    "ta_second",
    "ge_first",
    "ge_second",
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
  const questions = ["tc", "ta", "ge"];

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

// 防止漏填選項
function validateChoices() {
  const sections = document.querySelectorAll(".choice-section");
  let allAnswered = true;

  for (const section of sections) {
    const firstName = section.querySelector('input[name$="_first"]')?.name;
    const secondName = section.querySelector('input[name$="_second"]')?.name;

    if (!firstName || !secondName) continue;

    const firstInputs = section.querySelectorAll(`input[name="${firstName}"]`);
    const secondInputs = section.querySelectorAll(
      `input[name="${secondName}"]`
    );

    const firstSelected = section.querySelector(
      `input[name="${firstName}"]:checked`
    );
    const secondSelected = section.querySelector(
      `input[name="${secondName}"]:checked`
    );

    // 沒選的就加上閃爍效果
    if (!firstSelected) {
      firstInputs.forEach((input) => {
        input.parentElement.classList.add("blink");
        // 移除動畫 class，方便下次重新觸發
        setTimeout(() => input.parentElement.classList.remove("blink"), 1500);
      });
      allAnswered = false;
    }

    if (!secondSelected) {
      secondInputs.forEach((input) => {
        input.parentElement.classList.add("blink");
        setTimeout(() => input.parentElement.classList.remove("blink"), 1500);
      });
      allAnswered = false;
    }
  }

  return allAnswered;
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

// 初始化驗證
setupRadioValidation();

function closeModal() {
  const overlay = document.getElementById("manual");
  overlay.classList.remove("show");
  document.body.style.overflow = "auto";
}
function openModal() {
  const overlay = document.getElementById("manual");
  overlay.classList.add("show");
}

// 設定問題順序與紀錄使用者資訊
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateQuestionOrder(question_len) {
  const order = [];
  for (let i = 0; i < question_len; i++) {
    const arr = [0, 1, 2, 3];
    order.push(shuffleArray([...arr])); // 用 [...arr] 避免改動原陣列
  }
  localStorage.setItem("question_order", JSON.stringify(order));
  return order;
}

function getQuestionOrder() {
  let question_order =
    JSON.parse(localStorage.getItem("question_order")) ?? null;

  if (!question_order || question_order.length !== totalQuestions)
    question_order = generateQuestionOrder(totalQuestions);

  console.log("題目順序", question_order);
  return question_order;
}
