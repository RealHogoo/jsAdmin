<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div class="panel">
  <h3>System Health</h3>

  <div style="display:flex; gap:16px; flex-wrap:wrap;">
    <div style="border:1px solid #ddd; padding:12px; width:360px;">
      <h4>DB</h4>
      <pre id="dbBox">loading...</pre>
    </div>

    <div style="border:1px solid #ddd; padding:12px; width:360px;">
      <h4>Server</h4>
      <pre id="svBox">loading...</pre>
    </div>
  </div>

  <div style="margin-top:12px;">
    <button type="button" id="btnRefresh">Refresh</button>
    <span id="lastAt" style="margin-left:12px; color:#666;"></span>
  </div>
</div>

<script>
(function(){
  function postJson(url, body){
    return fetch(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: body ? JSON.stringify(body) : "{}"
    }).then(r => r.json());
  }

  function pretty(obj){
    return JSON.stringify(obj, null, 2);
  }

  function refresh(){
    postJson("/health/status.json").then(res => {
      if(!res || res.ok !== true){
        document.getElementById("dbBox").textContent = "error";
        document.getElementById("svBox").textContent = "error";
        return;
      }
      document.getElementById("dbBox").textContent = pretty(res.data.db);
      document.getElementById("svBox").textContent = pretty(res.data.server);
      document.getElementById("lastAt").textContent = "Last: " + new Date().toLocaleString();
    }).catch(e => {
      document.getElementById("dbBox").textContent = String(e);
      document.getElementById("svBox").textContent = String(e);
    });
  }

  document.getElementById("btnRefresh").addEventListener("click", refresh);
  refresh();
  setInterval(refresh, 10000); // 10초마다 갱신
})();
</script>
