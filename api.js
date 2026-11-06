const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlNzU6sVK9qWpbszb-v-aZMc1xJelyTx-NECyA0AeY6EkCsz9LRRUhb-3_TElpkMHO/exec";

function cleanDateStr(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d.getTime())) return String(str).split('T')[0];
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getCachedData() {
  const cached = localStorage.getItem('drone_cloud_cache');
  if (cached) {
    try { return JSON.parse(cached); } catch(e){}
  }
  return { registrations: [], dateConfigs: {}, customEvents: {} };
}

async function loadCloudData(onDataLoaded) {
  const localData = getCachedData();
  if (onDataLoaded) onDataLoaded(localData, true);

  showLoader(true);
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    const data = await res.json();
    
    const formattedData = {
      registrations: (data.registrations || []).map(r => ({ ...r, date: cleanDateStr(r.date) })),
      dateConfigs: data.dateConfigs || data.satConfigs || {},
      customEvents: data.customEvents || {}
    };

    localStorage.setItem('drone_cloud_cache', JSON.stringify(formattedData));
    
    if (onDataLoaded) onDataLoaded(formattedData, false);
  } catch (e) {
    console.error("雲端同步失敗:", e);
  } finally {
    showLoader(false);
  }
}

async function sendCloudAction(payload) {
  showLoader(true);
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (e) {
    alert("網路連線失敗，請稍後再試！");
  } finally {
    showLoader(false);
  }
}

function showLoader(show) {
  let loader = document.getElementById('syncLoader');
  if (!loader) return;
  if (show) loader.classList.remove('hidden');
  else loader.classList.add('hidden');
}
