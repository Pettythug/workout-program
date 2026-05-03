        const STORAGE_KEY = 'gym-tracker-script-url-v1';
        const TYPE_KEY = 'builder_last_workout_type';
        const NUM_KEY = 'builder_workout_num';
        const LOC_KEY = 'builder_location';
        const ACTIVE_PEOPLE_KEY = 'builder_active_people';
        
        let API_URL = '';
        let currentWorkout = null;
        let exerciseStatus = {};
        let currentMaxes = {};
        let currentAccessory = null;
        let activePeople = [];
        let exerciseSetCounters = {}; // tracks setNum per exercise idx
        let accessorySetCounter = 1;
        
        let globalData = null;

        // ── PASTE YOUR APPS SCRIPT DEPLOYMENT URL HERE ──────────────────────────
        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwtpr_4LEVCXRyMv_v86796HIN0v36kdULk7DVSI2x3R2KIbjh9KGWFV0lXT7x8MZTo7g/exec";
        // ────────────────────────────────────────────────────────────────────────

        function init() {
            API_URL = SCRIPT_URL;
            document.getElementById('configScreen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            loadDataAndWorkout();
        }

        function openSettings() {
            document.getElementById('settingsUrlInput').value = API_URL;
            
            const container = document.getElementById('activePeopleCheckboxes');
            const allPeople = globalData.people || ['Brian'];
            container.innerHTML = allPeople.map(p => `
                <label style="display:block; margin-bottom:8px; font-size:14px; font-family:var(--sans);">
                    <input type="checkbox" value="${p}" class="person-cb" ${activePeople.includes(p) ? 'checked' : ''} /> 
                    ${p}
                </label>
            `).join('');
            
            document.getElementById('settingsModal').classList.add('open');
        }

        function closeSettingsModal() { document.getElementById('settingsModal').classList.remove('open'); }
        function closeSettings(e) { if (e.target === document.getElementById('settingsModal')) closeSettingsModal(); }

        function saveSettings() {
            const url = document.getElementById('settingsUrlInput').value.trim();
            if (url) API_URL = url;
            
            const cbs = document.querySelectorAll('.person-cb');
            let selected = [];
            cbs.forEach(cb => { if (cb.checked) selected.push(cb.value); });
            if (selected.length === 0) selected = [(globalData.people || ['Brian'])[0]];
            
            activePeople = selected;
            localStorage.setItem(ACTIVE_PEOPLE_KEY, JSON.stringify(activePeople));
            
            closeSettingsModal();
            if (currentWorkout) {
                currentMaxes = {};
                currentWorkout.exercises.forEach(e => {
                    currentMaxes[e.name] = {};
                    activePeople.forEach(p => {
                        currentMaxes[e.name][p] = globalData.best?.[e.name]?.[p.toLowerCase()] || {};
                    });
                });
                renderWorkout(currentWorkout, currentWorkout.exercises);
            }
        }

        async function sheetsPost(payload) {
            const pStr = JSON.stringify(payload);
            const encoded = encodeURIComponent(pStr);
            const res = await fetch(API_URL + "?payload=" + encoded);
            const json = await res.json();
            return json;
        }

        async function loadDataAndWorkout() {
            showLoading();
            try {
                const res = await fetch(API_URL);
                const json = await res.json();
                if (json.status !== "ok") throw new Error("API Error");
                globalData = json.data;
                
                try {
                    const savedP = JSON.parse(localStorage.getItem(ACTIVE_PEOPLE_KEY));
                    if (savedP && Array.isArray(savedP) && savedP.length > 0) activePeople = savedP;
                    else activePeople = [(globalData.people || ['Brian'])[0]];
                } catch {
                    activePeople = [(globalData.people || ['Brian'])[0]];
                }
                
                setupSelectors();
                generateWorkout();
            } catch (err) {
                showError('Could not connect to your sheet. Check your URL in settings.');
                console.error(err);
            }
        }

        function setupSelectors() {
            const locSelect = document.getElementById('locationSelect');
            const locOptions = ['Anywhere', ...(globalData.locations || [])].filter((v,i,a)=>a.indexOf(v)===i);
            locSelect.innerHTML = locOptions.map(l => `<option value="${l}">${l}</option>`).join('');
            const savedLoc = localStorage.getItem(LOC_KEY) || 'Anywhere';
            if(locOptions.includes(savedLoc)) locSelect.value = savedLoc;
            locSelect.style.display = 'inline-block';
        }

        function changeLocation() {
            localStorage.setItem(LOC_KEY, document.getElementById('locationSelect').value);
            generateWorkout();
        }

        function generateWorkout() {
             const loc = document.getElementById('locationSelect').value;
             let lastType = localStorage.getItem(TYPE_KEY) || 'Pull';
             let type = lastType === 'Push' ? 'Pull' : 'Push';
             let num = parseInt(localStorage.getItem(NUM_KEY) || '0') + 1;
             
             const available = (globalData.exercises || []).filter(e => !e.timed && (e.location === 'Anywhere' || e.location === loc || !e.location));
             
             const pick = (categories) => {
                 const subset = available.filter(e => categories.includes(e.category));
                 if(subset.length === 0) return {name: `No ${categories[0]}`, category: categories[0]};
                 return subset[Math.floor(Math.random() * subset.length)];
             };
             
             const genExercises = type === 'Push' ? [
                 pick(['Explosive']),
                 pick(['Knee Dominant']),
                 pick(['Vertical Push']),
                 pick(['Horizontal Push']),
                 pick(['Rotational Core', 'Plank Core']),
             ] : [
                 pick(['Explosive']),
                 pick(['Hip Dominant']),
                 pick(['Vertical Pull']),
                 pick(['Horizontal Pull']),
                 pick(['Plank Core', 'Rotational Core']),
             ];
             
             currentWorkout = {
                 type: type,
                 workoutNum: num,
                 repRange: '8-12', 
                 exercises: genExercises
             };
             
             exerciseStatus = {};
             exerciseSetCounters = {};
             genExercises.forEach((e, idx) => { 
                 exerciseStatus[e.name] = 'pending'; 
                 exerciseSetCounters[idx] = 1;
             });
             
             currentMaxes = {};
             genExercises.forEach(e => {
                 currentMaxes[e.name] = {};
                 activePeople.forEach(p => {
                     currentMaxes[e.name][p] = globalData.best?.[e.name]?.[p.toLowerCase()] || {};
                 });
             });
             
             renderWorkout(currentWorkout, genExercises);
        }

        function renderWorkout(workout, exercises) {
            document.getElementById('headerSub').textContent = `#${workout.workoutNum} · ${workout.type} Day`;
            const badge = document.getElementById('workoutBadge');
            badge.textContent = workout.type;
            badge.className = `workout-badge badge-${workout.type.toLowerCase()}`;
            document.getElementById('infoWorkoutNum').textContent = workout.workoutNum;
            document.getElementById('infoRepRange').textContent = workout.repRange;

            const list = document.getElementById('exerciseList');
            list.innerHTML = '';
            
            // Build Location Options for Custom Machine Injection
            const activeLoc = document.getElementById('locationSelect').value;
            const fullLocOptions = ['Anywhere', ...(globalData.locations || [])].filter((v,i,a)=>a.indexOf(v)===i);
            const customLocDropdownHTML = fullLocOptions.map(l => `<option value="${l}" ${l===activeLoc ? 'selected':''}>${l}</option>`).join('');

            exercises.forEach((ex, idx) => {
                const card = document.createElement('div');
                card.className = 'exercise-card';
                card.id = `card-${idx}`;
                if (exerciseStatus[ex.name] === 'done') card.classList.add('done');
                if (exerciseStatus[ex.name] === 'skipped') card.classList.add('skipped');

                // Filter Swaps by Current Exercise Category
                const availableSwapProps = (globalData.exercises || []).filter(e => 
                    e.category === ex.category && 
                    (e.location === 'Anywhere' || e.location === activeLoc || !e.location) &&
                    e.name !== ex.name
                );
                
                let selectOptions = `<option value="custom" selected>-- Type Custom Machine --</option>`;
                availableSwapProps.sort((a,b) => a.name.localeCompare(b.name)).forEach(e => {
                    selectOptions += `<option value="${e.name}">${e.name}</option>`;
                });

                let headerHTML = `
                <div class="exercise-header" onclick="toggleCard(${idx})">
                  <div class="exercise-info">
                    <div class="exercise-category">${ex.category}</div>
                    <div class="exercise-name">${ex.name}</div>
                    <div class="exercise-max">
                `;
                
                activePeople.forEach(p => {
                    const maxData = currentMaxes[ex.name]?.[p] || {};
                    const currentMax = maxData['r8_12'] ? `${maxData['r8_12'].reps}x${maxData['r8_12'].weight}` : '—';
                    headerHTML += `<div style="font-size:10px; color:var(--muted); margin-top:2px;">${p} 8-12 Max: <span style="color:var(--accent);font-weight:500;" id="maxval-${idx}-${p}">${currentMax}</span></div>`;
                });
                
                headerHTML += `
                    </div>
                  </div>
                  <div class="exercise-status" id="status-icon-${idx}">${exerciseStatus[ex.name] === 'done' ? '✓' : (exerciseStatus[ex.name] === 'skipped' ? '—' : '')}</div>
                  <div class="expand-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>`;
                
                const curSetNum = exerciseSetCounters[idx] || 1;

                let inputsHTML = activePeople.map(p => `
                    <div class="set-row">
                        <div class="set-num" style="width:40px;">${p}</div>
                        <div class="set-input-group">
                          <input type="number" class="set-input" id="reps-${idx}-${p}" placeholder="reps" min="1" max="99">
                          <span class="set-separator">×</span>
                          <input type="number" class="set-input" id="weight-${idx}-${p}" placeholder="lbs" min="0" max="9999">
                        </div>
                    </div>
                `).join('');

                card.innerHTML = headerHTML + `
                <div class="set-logger" id="logger-${idx}">
                  <div class="rep-range-hint" style="margin-bottom:12px;">Target: <strong>${workout.repRange} reps</strong></div>
                  
                  <div class="sets-list">
                    ${inputsHTML}
                    <button class="complete-btn" style="padding:12px; margin-top:8px; font-size:14px;" id="logbtn-${idx}" onclick="logSet(${idx}, '${ex.name.replace(/'/g, "\\'")}')">Log Set ${curSetNum}</button>
                  </div>
                  <div class="new-max-banner" id="maxbanner-${idx}"></div>
                  <div class="exercise-actions" style="margin-top:16px;">
                    <button class="mark-done-btn" onclick="markDone(${idx}, '${ex.name.replace(/'/g, "\\'")}')">✓ Mark Done</button>
                    <button class="skip-btn" onclick="skipExercise(${idx}, '${ex.name.replace(/'/g, "\\'")}')">Skip</button>
                    <button class="more-time-btn" onclick="showSwap(${idx})">↺ Swap</button>
                  </div>
                </div>
                
                <div class="swap-ui" id="swap-ui-${idx}" style="display:none; padding:16px;">
                   <p style="margin-bottom:8px; font-size:12px; color:var(--muted);">Select Replacement Exercise:</p>
                   <select id="swap-select-${idx}" class="header-select" style="width:100%; margin-bottom:8px; padding:8px; font-size:14px; background:var(--surface);" onchange="checkCustom(${idx})">
                      ${selectOptions}
                   </select>
                   <div id="swap-custom-block-${idx}" style="margin-bottom:12px; padding:8px; background:var(--bg); border-radius:8px;">
                       <input type="text" id="swap-custom-${idx}" class="set-input" placeholder="New Machine Name..." style="width:100%; margin-bottom:8px; font-size:14px; padding:8px;">
                       <select id="swap-loc-${idx}" class="header-select" style="width:100%; padding:8px; font-size:14px; background:var(--surface);">
                          ${customLocDropdownHTML}
                       </select>
                       <p style="font-size:10px; color:var(--muted); margin-top:6px;">Saving as a <span style="font-weight:600;">${ex.category}</span> exercise.</p>
                   </div>
                   <div style="display:flex; gap:8px;">
                     <button class="complete-btn" style="flex:1; padding:8px; font-size:14px;" id="confirm-swap-btn-${idx}" onclick="confirmSwap(${idx})">Confirm</button>
                     <button class="skip-btn" style="flex:1; padding:8px; font-size:14px;" onclick="hideSwap(${idx})">Cancel</button>
                   </div>
                </div>
                `;
                
                list.appendChild(card);
            });

            hideLoading();
            document.getElementById('workoutContent').style.display = 'block';
        }

        function showSwap(idx) {
            document.getElementById(`logger-${idx}`).style.display = 'none';
            document.getElementById(`swap-ui-${idx}`).style.display = 'block';
            document.getElementById(`swap-select-${idx}`).value = 'custom';
            checkCustom(idx);
        }
        
        function hideSwap(idx) {
            document.getElementById(`logger-${idx}`).style.display = 'block';
            document.getElementById(`swap-ui-${idx}`).style.display = 'none';
        }
        
        function checkCustom(idx) {
            const val = document.getElementById(`swap-select-${idx}`).value;
            const customBlock = document.getElementById(`swap-custom-block-${idx}`);
            if (val === 'custom') customBlock.style.display = 'block';
            else customBlock.style.display = 'none';
        }
        
        async function confirmSwap(idx) {
            const btn = document.getElementById(`confirm-swap-btn-${idx}`);
            const selectVal = document.getElementById(`swap-select-${idx}`).value;
            let newName = '';
            let newCat = currentWorkout.exercises[idx].category;
            
            if (selectVal === 'custom') {
                const typed = document.getElementById(`swap-custom-${idx}`).value.trim();
                let selectedLoc = document.getElementById(`swap-loc-${idx}`).value;
                if (!typed) { alert('Please enter a custom machine name.'); return; }
                
                newName = typed;
                btn.textContent = 'Saving...';
                btn.disabled = true;
                
                const req = {
                   action: "saveExercise",
                   exercise: newName,
                   category: newCat,
                   location: selectedLoc,
                   timed: false
                };
                
                try {
                    await sheetsPost(req);
                    // Add directly to in-memory global data so algorithm recognizes it immediately
                    globalData.exercises.push({
                        name: newName,
                        category: newCat,
                        location: selectedLoc,
                        timed: false
                    });
                } catch(e) {
                    console.error(e);
                    alert("Warning: Could not save the new exercise to the master database. It will still swap for this session.");
                }
                
                btn.textContent = 'Confirm';
                btn.disabled = false;
                
            } else {
                newName = selectVal;
                const found = globalData.exercises.find(e => e.name === newName);
                if(found) newCat = found.category;
            }
            
            const oldName = currentWorkout.exercises[idx].name;
            currentWorkout.exercises[idx] = { name: newName, category: newCat };
            
            delete exerciseStatus[oldName];
            exerciseStatus[newName] = 'pending';
            exerciseSetCounters[idx] = 1;

            currentMaxes[newName] = {};
            activePeople.forEach(p => {
                 currentMaxes[newName][p] = globalData.best?.[newName]?.[p.toLowerCase()] || {};
            });
            
            renderWorkout(currentWorkout, currentWorkout.exercises);
            toggleCard(idx);
        }

        function toggleCard(idx) {
            const card = document.getElementById(`card-${idx}`);
            if (card.classList.contains('done') || card.classList.contains('skipped')) return;
            card.classList.toggle('open');
        }

        function toggleAccessory() {
            const logger = document.getElementById('accessoryLogger');
            const card = document.getElementById('accessoryCard');
            card.classList.toggle('open');
            logger.style.display = card.classList.contains('open') ? 'block' : 'none';
        }

        function getRangeForReps(reps) {
            if (reps <= 3) return '1-3';
            if (reps <= 7) return '4-7';
            if (reps <= 12) return '8-12';
            return '13+';
        }
        
        function getRangeKey(rangeLabel) {
            if (rangeLabel === '1-3') return 'r1_3';
            if (rangeLabel === '4-7') return 'r4_7';
            if (rangeLabel === '8-12') return 'r8_12';
            return 'r13_plus';
        }

        async function logSet(cardIdx, exerciseName) {
            const setNum = exerciseSetCounters[cardIdx] || 1;
            const btn = document.getElementById(`logbtn-${cardIdx}`);
            btn.textContent = 'Saving...'; 
            btn.disabled = true;

            const entries = [];
            const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            
            let bannerMsg = "";

            for (const p of activePeople) {
                const repsVal = document.getElementById(`reps-${cardIdx}-${p}`).value;
                const weightVal = document.getElementById(`weight-${cardIdx}-${p}`).value;
                if (!repsVal) continue;
                
                const reps = parseInt(repsVal);
                const weight = parseFloat(weightVal) || 0;
                
                const repRange = getRangeForReps(reps);
                const rangeKey = getRangeKey(repRange);
                
                entries.push({
                   date: dateStr,
                   person: p.toLowerCase(),
                   reps: reps.toString(),
                   weight: weightVal || "",
                   range: rangeKey,
                   note: `Set ${setNum} (Builder #${currentWorkout.workoutNum})`,
                   setNum: setNum,
                   timed: false
                });
                
                const existing = currentMaxes[exerciseName]?.[p]?.[rangeKey];
                let isNew = !existing;
                if (existing) {
                    if (weight > parseFloat(existing.weight)) isNew = true;
                }
                if (isNew) {
                    if(!currentMaxes[exerciseName]) currentMaxes[exerciseName] = {};
                    if(!currentMaxes[exerciseName][p]) currentMaxes[exerciseName][p] = {};
                    currentMaxes[exerciseName][p][rangeKey] = {reps, weight};
                    const newMaxStr = `${reps}x${weight}`;
                    bannerMsg += `🏆 ${p} New ${repRange} max: ${newMaxStr}<br>`;
                    if (rangeKey === 'r8_12') {
                        const valId = document.getElementById(`maxval-${cardIdx}-${p}`);
                        if(valId) valId.textContent = newMaxStr;
                    }
                }
            }

            if (entries.length === 0) {
                alert('Please enter reps for at least one person.');
                btn.textContent = `Log Set ${setNum}`;
                btn.disabled = false;
                return;
            }

            const req = {
               action: "logSet",
               exercise: exerciseName,
               entries: entries
            };
            
            try {
                await sheetsPost(req);
                
                if (bannerMsg) {
                    const banner = document.getElementById(`maxbanner-${cardIdx}`);
                    if (banner) { banner.style.display = 'block'; banner.innerHTML = bannerMsg; }
                }
                
                activePeople.forEach(p => {
                    const rEl = document.getElementById(`reps-${cardIdx}-${p}`);
                    const wEl = document.getElementById(`weight-${cardIdx}-${p}`);
                    if (rEl) rEl.value = '';
                    if (wEl) wEl.value = '';
                });
                
                exerciseSetCounters[cardIdx] = setNum + 1;
                btn.textContent = `Log Set ${exerciseSetCounters[cardIdx]}`;
                btn.disabled = false;
                
            } catch(e) {
                console.error(e);
                alert('Failed to log set. Check console.');
                btn.textContent = `Log Set ${setNum}`;
                btn.disabled = false;
            }
        }

        function markDone(idx, exerciseName) {
            exerciseStatus[exerciseName] = 'done';
            const card = document.getElementById(`card-${idx}`);
            card.classList.remove('open');
            card.classList.add('done');
            document.getElementById(`status-icon-${idx}`).textContent = '✓';
            checkAllComplete();
        }

        function skipExercise(idx, exerciseName) {
            exerciseStatus[exerciseName] = 'skipped';
            const card = document.getElementById(`card-${idx}`);
            card.classList.remove('open');
            card.classList.add('skipped');
            document.getElementById(`status-icon-${idx}`).textContent = '—';
            checkAllComplete();
        }

        function checkAllComplete() {
            const allResolved = Object.values(exerciseStatus).every(s => s === 'done' || s === 'skipped');
            document.getElementById('completeBtn').disabled = !allResolved;
            if (allResolved) document.getElementById('gotMoreBtn').style.display = 'block';
        }

        function completeWorkout() {
            localStorage.setItem(TYPE_KEY, currentWorkout.type);
            localStorage.setItem(NUM_KEY, currentWorkout.workoutNum.toString());
            document.getElementById('workoutContent').style.display = 'none';
            document.getElementById('successState').style.display = 'block';
            markAccessoryDone();
        }

        function markAccessoryDone() {
            const card = document.getElementById('accessoryCard');
            card.classList.remove('open');
            card.classList.add('done');
            document.getElementById('accessoryLogger').style.display = 'none';
            document.getElementById('suggestDiffBtn').style.display = 'none';
        }

        function getAccessory() {
            document.getElementById('gotMoreBtn').style.display = 'none';
            document.getElementById('accessorySection').style.display = 'block';
            
            const loc = document.getElementById('locationSelect').value;
            const availableAcc = (globalData.exercises || []).filter(e => e.category === 'Accessory' && (e.location === 'Anywhere' || e.location === loc || !e.location));
            
            if(availableAcc.length === 0) {
                document.getElementById('accessoryName').textContent = 'No accessories available';
                return;
            }
            const picked = availableAcc[Math.floor(Math.random() * availableAcc.length)];
            currentAccessory = picked.name;
            
            accessorySetCounter = 1;
            
            document.getElementById('accessoryName').textContent = currentAccessory;
            document.getElementById('accessoryRepRange').textContent = currentWorkout.repRange;

            let maxInfo = '';
            activePeople.forEach(p => {
                const accMaxObj = globalData.best?.[currentAccessory]?.[p.toLowerCase()] || {};
                const accMax = accMaxObj['r8_12'] ? `${accMaxObj['r8_12'].reps}x${accMaxObj['r8_12'].weight}` : '—';
                maxInfo += `<div style="font-size:10px; color:var(--muted); margin-top:2px;">${p} 8-12 Max: <span style="color:var(--accent);font-weight:500;">${accMax}</span></div>`;
            });
            document.getElementById('accessoryMax').innerHTML = maxInfo;
            
            const accList = document.getElementById('accSetsList');
            accList.innerHTML = activePeople.map(p => `
                <div class="set-row">
                    <div class="set-num" style="width:40px;">${p}</div>
                    <div class="set-input-group">
                      <input type="number" class="set-input" id="acc-reps-${p}" placeholder="reps" min="1" max="99">
                      <span class="set-separator">×</span>
                      <input type="number" class="set-input" id="acc-weight-${p}" placeholder="lbs" min="0" max="9999">
                    </div>
                </div>
            `).join('');

            document.getElementById(`acc-logbtn`).textContent = 'Log Set 1';
            document.getElementById(`acc-logbtn`).disabled = false;
            document.getElementById('acc-maxbanner').style.display = 'none';
        }

        async function logAccessorySet() {
            const btn = document.getElementById(`acc-logbtn`);
            const setNum = accessorySetCounter;
            btn.textContent = 'Saving...'; btn.disabled = true;

            const entries = [];
            const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            
            let bannerMsg = "";

            for (const p of activePeople) {
                const repsVal = document.getElementById(`acc-reps-${p}`).value;
                const weightVal = document.getElementById(`acc-weight-${p}`).value;
                if (!repsVal) continue;
                
                const reps = parseInt(repsVal);
                const weight = parseFloat(weightVal) || 0;
                const repRange = getRangeForReps(reps);
                const rangeKey = getRangeKey(repRange);
                
                entries.push({
                   date: dateStr,
                   person: p.toLowerCase(),
                   reps: reps.toString(),
                   weight: weightVal || "",
                   range: rangeKey,
                   note: `Accessory Set ${setNum} (Builder #${currentWorkout.workoutNum})`,
                   setNum: setNum,
                   timed: false
                });
                
                const accMaxObj = globalData.best?.[currentAccessory]?.[p.toLowerCase()] || {};
                const existing = accMaxObj[rangeKey];
                let isNew = !existing;
                if (existing && weight > parseFloat(existing.weight)) isNew = true;
                
                if (isNew) {
                    bannerMsg += `🏆 ${p} New ${repRange} max: ${reps}x${weight}<br>`;
                }
            }
            
            if(entries.length === 0){
                alert('Please enter reps.');
                btn.textContent = `Log Set ${setNum}`;
                btn.disabled = false;
                return;
            }

            const req = {
               action: "logSet",
               exercise: currentAccessory,
               entries: entries
            };
            
            try {
                await sheetsPost(req);
                if (bannerMsg) {
                    const banner = document.getElementById('acc-maxbanner');
                    banner.style.display = 'block';
                    banner.innerHTML = bannerMsg;
                }
                
                activePeople.forEach(p => {
                    const rEl = document.getElementById(`acc-reps-${p}`);
                    const wEl = document.getElementById(`acc-weight-${p}`);
                    if (rEl) rEl.value = '';
                    if (wEl) wEl.value = '';
                });
                
                accessorySetCounter++;
                btn.textContent = `Log Set ${accessorySetCounter}`;
                btn.disabled = false;
                
            } catch(e) {
                alert('Failed to log accessory set.');
                btn.textContent = `Log Set ${setNum}`;
                btn.disabled = false;
            }
        }

        function showLoading() { document.getElementById('loadingState').style.display = 'block'; document.getElementById('errorState').style.display = 'none'; document.getElementById('workoutContent').style.display = 'none'; document.getElementById('successState').style.display = 'none'; }
        function hideLoading() { document.getElementById('loadingState').style.display = 'none'; }
        function showError(msg) { hideLoading(); document.getElementById('errorState').style.display = 'block'; document.getElementById('errorState').textContent = msg; }

        init();
