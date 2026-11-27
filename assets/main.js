(()=>{'use strict';
const navButton = document.querySelector('.nav-button');
const navigation = document.getElementById('nav');
if (navButton && navigation) {
  function setMenu(open) {
    navButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('open', open);
  }
  navButton.addEventListener('click', () => setMenu(navButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      navButton.focus();
    }
  });
}
const search = document.getElementById('guide-search');
if (search) {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('#guide-grid .article-card')];
  let category = 'all';
  function update() {
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const text = (card.dataset.title + ' ' + card.dataset.category).toLowerCase();
      const visible = (category === 'all' || card.dataset.category === category) && terms.every(term => text.includes(term));
      card.hidden = !visible;
      if (visible) count++;
    }
    document.getElementById('guide-count').textContent = 'Showing ' + count + (count === 1 ? ' guide' : ' guides');
    document.getElementById('guide-empty').hidden = count !== 0;
  }
  for (const filter of filters) {
    filter.addEventListener('click', () => {
      category = filter.dataset.filter;
      for (const button of filters) {
        button.classList.toggle('active', button === filter);
        button.setAttribute('aria-pressed', String(button === filter));
      }
      update();
    });
  }
  search.addEventListener('input', update);
}
const pathfinder = document.getElementById('pathfinder-form');
if (pathfinder) {
  const choices = {
    one: ['One website will not load', '/guides/one-website-not-loading.html', 'Try the public homepage and the affected path under the same hostname. Record whether you get a DNS message, an HTTP error, or a page that opens but stays blank.'],
    all: ['Many websites fail', '/guides/all-websites-not-loading.html', 'Try two unrelated bookmarked sites and a second device on the same network. Keep the network fixed while comparing devices.'],
    login: ['The sign-in starts again', '/guides/login-loop-and-signin.html', 'Note whether the service accepted the sign-in before returning you to the first screen. Check site-specific storage and extension behavior in a second profile. Save drafts and recovery options before removing site data.'],
    slow: ['Slow pages or freezes', '/guides/browser-slow-memory.html', 'Save unsent work and compare a light page with the workload that feels slow. Watch which tab is expensive during the task and after closing it.'],
    download: ['A download did not arrive', '/guides/downloads-failing.html', 'Open the browser downloads panel, note the exact message and check the destination folder. Use a known small text file for comparison. Leave malware warnings in place.'],
    camera: ['Camera or microphone access failed', '/guides/camera-microphone-site.html', 'Test each input separately. Check the physical device and OS permission, then the exact meeting site’s permission and selected input.'],
    security: ['A certificate warning', '/guides/security-certificate-warning.html', 'Stop at the warning. Note the hostname and visible error, check that your device clock is plausible, and compare on a second trusted device.'],
    alerts: ['Unexpected notifications', '/guides/notification-popups.html', 'Identify the originating app and hostname from the notification settings without opening the alert. Revoke the site permission in the browser profile that granted it.'],
    alias: ['Only one version of the domain opens', '/hosting/apex-and-www.html', 'Write down the bare and www names separately. For each, check DNS assignment, certificate status, and the final hostname and path.'],
    missing: ['A published deep link returns 404', '/hosting/static-site-deep-link-404.html', 'Open the exact path directly on the production domain and the deployed project address. Check for an exact case-sensitive file or configured route in the publish output.'],
    style: ['A published page has lost its styles', '/hosting/html-instead-of-css.html', 'Reload with the Network panel open and select the stylesheet. Keep the status, media type and first part of the body together. A successful response can contain HTML.']
  };
  const profiles = {
    chrome: ['Chrome', '/guides/chrome-crash-reset.html'],
    safari: ['Safari', '/guides/safari-mac-permissions.html'],
    firefox: ['Firefox', '/guides/firefox-troubleshoot-mode.html'],
    edge: ['Edge', '/guides/edge-startup-crash.html']
  };
  const ownerCases = new Set(['alias','missing','style']);
  const output = document.getElementById('path-output');
  let plan = '';
  pathfinder.addEventListener('change', () => {
    output.hidden = true;
    plan = '';
  });
  pathfinder.addEventListener('submit', (event) => {
    event.preventDefault();
    const symptom = document.getElementById('symptom').value;
    const scope = document.getElementById('scope').value;
    const change = document.getElementById('changed').value;
    const [browserName, browserURL] = profiles[document.getElementById('browser').value];
    const [title, url, first] = choices[symptom];
    const steps = [first];
    if (scope === 'other-ok') {
      steps.push('One browser works. Compare the identical hostname, path, sign-in state and time of the two attempts. Keep the working session available for comparison.');
    } else if (scope === 'everywhere') {
      steps.push(ownerCases.has(symptom) ? 'Several browsers see it. Compare a public example on the production deployment with the custom name before changing local browser settings.' : 'Several browsers see it. Compare a second device and, if practical, a second network before narrowing the issue to the website, account or operating system.');
    } else {
      steps.push('Repeat the same action in one other browser and record its result before changing anything.');
    }
    if (change === 'deploy') {
      steps.push('Compare the last known working deployment or DNS change with the first failure. Record the time and the production version. A matching timestamp is a lead to verify.');
    } else if (change === 'yes') {
      steps.push('Record the version, platform and channel from the browser’s own About screen and match them to a dated vendor release entry.');
    }
    steps.push('Repeat the original action after one change. Write down the visible outcome and keep private query strings, account tokens and personal data out of a support report.');
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-why').textContent = 'Selected browser: ' + browserName + '. These steps follow the symptoms you entered.';
    const ordered = document.getElementById('result-steps');
    ordered.replaceChildren(...steps.map(step => {
      const li = document.createElement('li'); li.textContent = step; return li;
    }));
    const holder = document.getElementById('result-link');
    holder.replaceChildren();
    function link(href, label) {
      const a = document.createElement('a'); a.href = href; a.textContent = label; holder.append(a);
    }
    link(url, 'Read the guide');
    if (symptom === 'slow' && scope === 'other-ok') link(browserURL, 'Check ' + browserName + ' settings');
    if (symptom === 'style' || symptom === 'missing') link('/tools/response-workbench/', 'Try the response examples');
    plan = ['BrowserSignal Issue Pathfinder',browserName + ' · ' + title,'',...steps.map((step,i) => (i + 1) + '. ' + step),'',location.origin + url].join('\n');
    document.getElementById('copy-message').textContent = '';
    output.hidden = false;
    output.scrollIntoView({block:'start'});
  });
  document.getElementById('copy-plan').addEventListener('click', async () => {
    const status = document.getElementById('copy-message');
    try {
      await navigator.clipboard.writeText(plan); status.textContent = 'Copied. Review the text before sharing.';
    } catch {
      status.textContent = 'Clipboard access is unavailable. Select the visible plan to copy it manually.';
    }
  });
}
const logForm=document.getElementById('log-form');if(logForm){const KEY='browsersignal.fixlog.v1';const msg=document.getElementById('log-message');const checks=[...logForm.querySelectorAll('[data-check]')];const collect=()=>({title:document.getElementById('issue-name').value,browser:document.getElementById('log-browser').value,symptom:document.getElementById('log-symptom').value,result:document.getElementById('log-result').value,checks:checks.filter(c=>c.checked).map(c=>c.dataset.check),savedAt:new Date().toISOString()});const load=(data)=>{document.getElementById('issue-name').value=data.title||'';document.getElementById('log-browser').value=data.browser||'Chrome';document.getElementById('log-symptom').value=data.symptom||'';document.getElementById('log-result').value=data.result||'';checks.forEach(c=>{c.checked=(data.checks||[]).includes(c.dataset.check)});};try{const value=localStorage.getItem(KEY);if(value)load(JSON.parse(value));}catch{msg.textContent='Local storage is blocked in this browser. Export still works.';}document.getElementById('save-log').addEventListener('click',()=>{try{localStorage.setItem(KEY,JSON.stringify(collect()));msg.textContent='Saved locally in this browser. You can export a copy as TXT.';}catch{msg.textContent='Unable to save locally. Use Export TXT instead.';}});document.getElementById('export-log').addEventListener('click',()=>{const x=collect();const lines=['BROWSERSIGNAL FIX LOG','Created: '+x.savedAt,'Issue: '+x.title,'Browser: '+x.browser,'','Symptom:',x.symptom,'','Tests completed:',...x.checks.map(c=>'- '+c),'','Result / next actions:',x.result,'','Do not share account secrets with support staff.'];const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='browsersignal-fix-log.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),300);msg.textContent='Plain-text log exported. Review for sensitive content before sharing.';});document.getElementById('clear-log').addEventListener('click',()=>{if(!confirm('Delete the locally saved log and clear this form?'))return;try{localStorage.removeItem(KEY);logForm.reset();msg.textContent='Local log cleared.';}catch{msg.textContent='Local storage is unavailable. The saved log could not be cleared.';}});}
})();