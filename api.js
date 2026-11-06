const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlNzU6sVK9qWpbszb-v-aZMc1xJelyTx-NECyA0AeY6EkCsz9LRRUhb-3_TElpkMHO/exec";

function cleanDateStr(str) {
  if (!str) return '';
  if (typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
    return str.trim();
  }
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
    const res = await fetch(GOOGLE_SCRIPT_URL + '?t=' + Date.now()); 
    const data = await res.json();
    
    const registrations = (data.registrations || []).map(r => ({
      ...r,
      date: cleanDateStr(r.date)
    }));

    const dateConfigs = {};
    const customEvents = {};

    if (data.dateConfigs) {
      Object.keys(data.dateConfigs).forEach(k => {
        const cleanK = cleanDateStr(k);
        dateConfigs[cleanK] = data.dateConfigs[k];
      });
    }

    if (data.customEvents) {
      Object.keys(data.customEvents).forEach(k => {
        const cleanK = cleanDateStr(k);
        customEvents[cleanK] = data.customEvents[k];
      });
    }

    const formattedData = { registrations, dateConfigs, customEvents };

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
